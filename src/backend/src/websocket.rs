use std::{
    collections::HashMap,
    sync::{Arc, Mutex},
    time::Duration,
};
use axum::{
    extract::{Path, State, WebSocketUpgrade},
    response::Response,
};
use futures::{sink::SinkExt, stream::StreamExt};
use serde::{Deserialize, Serialize};
use tokio::{sync::broadcast, time::timeout};
use axum::extract::ws::{Message, WebSocket};
use tracing::{error, info, warn};

// WebSocketメッセージの型定義
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(tag = "type", content = "payload")]
pub enum WebSocketMessage {
    ElementUpdate {
        id: String,
        project_id: String,
        data: serde_json::Value,
        timestamp: String,
        user_id: String,
    },
    ElementDelete {
        id: String,
        project_id: String,
        timestamp: String,
        user_id: String,
    },
    RelationshipUpdate {
        id: String,
        project_id: String,
        data: serde_json::Value,
        timestamp: String,
        user_id: String,
    },
    ViewUpdate {
        project_id: String,
        view_type: String,
        state: serde_json::Value,
        timestamp: String,
        user_id: String,
    },
}

// エラー型の定義
#[derive(Debug, thiserror::Error)]
pub enum WebSocketError {
    #[error("Failed to parse message: {0}")]
    ParseError(String),
    #[error("Failed to send message: {0}")]
    SendError(String),
    #[error("Connection timeout")]
    Timeout,
    #[error("Connection closed")]
    Closed,
}

// プロジェクトごとの接続管理
#[derive(Debug, Default, Clone)]
pub struct ConnectionManager {
    connections: Arc<Mutex<HashMap<String, broadcast::Sender<WebSocketMessage>>>>,
}

impl ConnectionManager {
    pub fn new() -> Self {
        Self {
            connections: Arc::new(Mutex::new(HashMap::new())),
        }
    }

    // プロジェクトのチャンネル取得（なければ作成）
    pub fn get_or_create_channel(&self, project_id: &str) -> broadcast::Sender<WebSocketMessage> {
        let mut connections = self.connections.lock().unwrap();
        if let Some(sender) = connections.get(project_id) {
            sender.clone()
        } else {
            let (sender, _) = broadcast::channel(100);
            connections.insert(project_id.to_string(), sender.clone());
            info!("Created new channel for project: {}", project_id);
            sender
        }
    }

    // プロジェクトのチャンネル削除
    pub fn remove_channel(&self, project_id: &str) {
        let mut connections = self.connections.lock().unwrap();
        if connections.remove(project_id).is_some() {
            info!("Removed channel for project: {}", project_id);
        }
    }
}

// WebSocket接続ハンドラ
pub async fn handler(
    ws: WebSocketUpgrade,
    Path(project_id): Path<String>,
    State(manager): State<ConnectionManager>,
) -> Response {
    info!("New WebSocket connection request for project: {}", project_id);
    ws.on_upgrade(|socket| handle_socket(socket, project_id, manager))
}

// WebSocket接続の処理
async fn handle_socket(socket: WebSocket, project_id: String, manager: ConnectionManager) {
    let (mut sender, mut receiver) = socket.split();

    // プロジェクトのチャンネル取得
    let tx = manager.get_or_create_channel(&project_id);
    let mut rx = tx.subscribe();

    info!("WebSocket connection established for project: {}", project_id);

    // 受信ループ
    let mut recv_task = tokio::spawn(async move {
        while let Some(result) = receiver.next().await {
            match result {
                Ok(msg) => {
                    match msg {
                        Message::Text(text) => {
                            match serde_json::from_str::<WebSocketMessage>(&text) {
                                Ok(ws_msg) => {
                                    if let Err(e) = tx.send(ws_msg) {
                                        error!("Failed to broadcast message: {}", e);
                                    }
                                }
                                Err(e) => {
                                    error!("Failed to parse message: {}", e);
                                    // エラーメッセージを送信
                                    if let Err(e) = sender.send(Message::Text(format!("{{\"error\": \"Invalid message format: {}\"}}", e))).await {
                                        error!("Failed to send error message: {}", e);
                                    }
                                }
                            }
                        }
                        Message::Close(reason) => {
                            info!("Client disconnected: {:?}", reason);
                            break;
                        }
                        Message::Ping(data) => {
                            if let Err(e) = sender.send(Message::Pong(data)).await {
                                error!("Failed to send pong: {}", e);
                            }
                        }
                        _ => {}
                    }
                }
                Err(e) => {
                    error!("WebSocket receive error: {}", e);
                    break;
                }
            }
        }
    });

    // 送信ループ
    let mut send_task = tokio::spawn(async move {
        while let Ok(msg) = rx.recv().await {
            match serde_json::to_string(&msg) {
                Ok(text) => {
                    // タイムアウト付きで送信
                    match timeout(Duration::from_secs(5), sender.send(Message::Text(text))).await {
                        Ok(result) => {
                            if let Err(e) = result {
                                error!("Failed to send message: {}", e);
                                break;
                            }
                        }
                        Err(_) => {
                            error!("Send timeout");
                            break;
                        }
                    }
                }
                Err(e) => {
                    error!("Failed to serialize message: {}", e);
                }
            }
        }
    });

    // どちらかのタスクが終了したら両方を終了
    tokio::select! {
        _ = (&mut recv_task) => {
            warn!("Receive task ended for project: {}", project_id);
            send_task.abort();
        }
        _ = (&mut send_task) => {
            warn!("Send task ended for project: {}", project_id);
            recv_task.abort();
        }
    };

    // 接続が切れた時の処理
    if rx.receiver_count() == 0 {
        manager.remove_channel(&project_id);
    }
    
    info!("WebSocket connection closed for project: {}", project_id);
} 