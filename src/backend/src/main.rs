use axum::{
    routing::{get, post, put, delete},
    Router,
};
use sqlx::SqlitePool;
use tokio::net::TcpListener;
use tower_http::cors::CorsLayer;
use std::sync::Arc;

mod models;
mod handlers;
mod db;
mod error;
mod websocket;

use crate::{
    handlers::{
        projects,
        elements,
        relationships,
        views,
        history,
    },
    websocket::{handler as ws_handler, ConnectionManager},
};

#[derive(Clone)]
pub struct AppState {
    db: SqlitePool,
    ws_manager: Arc<ConnectionManager>,
}

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    // 環境変数の読み込み
    dotenv::dotenv().ok();
    
    // ロガーの初期化
    tracing_subscriber::fmt::init();

    // データベース接続
    let database_url = std::env::var("DATABASE_URL")
        .unwrap_or_else(|_| "sqlite:./data/rddm.db".to_string());
    
    let pool = SqlitePool::connect(&database_url).await?;

    // マイグレーションの実行
    sqlx::migrate!("./migrations").run(&pool).await?;

    // WebSocket接続管理の初期化
    let ws_manager = Arc::new(ConnectionManager::new());

    // アプリケーション状態の作成
    let state = AppState {
        db: pool,
        ws_manager: ws_manager.clone(),
    };

    // ルーターの設定
    let app = Router::new()
        // プロジェクト関連
        .route("/api/projects", get(projects::list_projects))
        .route("/api/projects", post(projects::create_project))
        .route("/api/projects/:id", get(projects::get_project))
        .route("/api/projects/:id", put(projects::update_project))
        .route("/api/projects/:id", delete(projects::delete_project))
        
        // 要素関連
        .route("/api/projects/:project_id/elements", get(elements::list_elements))
        .route("/api/projects/:project_id/elements", post(elements::create_element))
        .route("/api/projects/:project_id/elements/:element_id", get(elements::get_element))
        .route("/api/projects/:project_id/elements/:element_id", put(elements::update_element))
        .route("/api/projects/:project_id/elements/:element_id", delete(elements::delete_element))
        
        // 関係性関連
        .route("/api/projects/:project_id/relationships", get(relationships::list_relationships))
        .route("/api/projects/:project_id/relationships", post(relationships::create_relationship))
        .route("/api/projects/:project_id/relationships/:relationship_id", put(relationships::update_relationship))
        .route("/api/projects/:project_id/relationships/:relationship_id", delete(relationships::delete_relationship))
        
        // ビュー関連
        .route("/api/projects/:project_id/views", get(views::list_views))
        .route("/api/projects/:project_id/views/:view_type", get(views::get_view))
        .route("/api/projects/:project_id/views/:view_type", put(views::update_view))
        
        // 変更履歴関連
        .route("/api/projects/:project_id/history", get(history::get_history))
        
        // WebSocket
        .route("/ws/projects/:project_id", get(ws_handler))
        
        // CORS設定
        .layer(CorsLayer::permissive())
        
        // アプリケーション状態の共有
        .with_state(state);

    // サーバーの起動
    let addr = "0.0.0.0:3000";
    let listener = TcpListener::bind(addr).await?;
    println!("Server running on http://{}", addr);

    axum::serve(listener, app).await?;

    Ok(())
} 