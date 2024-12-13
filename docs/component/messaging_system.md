# メッセージングシステム仕様書

## 1. 概要
本文書では、MVPにおけるコンポーネント間の直接的なメッセージ交換を管理するメッセージングシステムを定義します。イベントバスとは異なり、特定のコンポーネント間での同期的な通信や、大きなデータの受け渡しに使用します。

## 2. メッセージングシステムの責務
- コンポーネント間の直接的な通信の実現
- 大規模データの効率的な転送
- 同期・非同期通信の両方のサポート
- メッセージの信頼性保証

## 3. メッセージ定義

### 3.1 基本メッセージ構造
```rust
#[derive(Debug, Clone)]
pub struct Message {
    pub id: MessageId,
    pub message_type: MessageType,
    pub sender: ComponentId,
    pub receiver: ComponentId,
    pub payload: MessagePayload,
    pub timestamp: SystemTime,
}

#[derive(Debug, Clone)]
pub enum MessageType {
    Command,
    Query,
    Response,
    Notification,
    DataTransfer,
}

#[derive(Debug, Clone)]
pub enum ComponentId {
    Window,
    Graphics,
    UI,
    CAD,
    System,
}
```

### 3.2 メッセージペイロード
```rust
#[derive(Debug, Clone)]
pub enum MessagePayload {
    // コマンド関連
    Command {
        name: String,
        parameters: HashMap<String, Value>,
    },
    
    // クエリ関連
    Query {
        query_type: String,
        parameters: HashMap<String, Value>,
    },
    
    // レスポンス関連
    Response {
        status: ResponseStatus,
        data: Option<Value>,
        error: Option<String>,
    },
    
    // データ転送関連
    Data {
        format: DataFormat,
        content: Vec<u8>,
        metadata: HashMap<String, String>,
    },
}

#[derive(Debug, Clone)]
pub enum ResponseStatus {
    Success,
    Partial,
    Error,
}

#[derive(Debug, Clone)]
pub enum DataFormat {
    Binary,
    JSON,
    ProtoBuf,
    Custom(String),
}
```

## 4. メッセージングシステムの実装

### 4.1 メッセージングシステムの構造
```rust
pub struct MessagingSystem {
    channels: HashMap<(ComponentId, ComponentId), MessageChannel>,
    handlers: HashMap<ComponentId, Box<dyn MessageHandler>>,
}

pub struct MessageChannel {
    sender: mpsc::Sender<Message>,
    receiver: mpsc::Receiver<Message>,
    buffer_size: usize,
}

pub trait MessageHandler: Send + Sync {
    fn handle(&self, message: Message) -> Result<Option<Message>, Error>;
}
```

### 4.2 主要メソッド
```rust
impl MessagingSystem {
    pub fn send_message(&mut self, message: Message) -> Result<(), Error> {
        // メッセージの送信処理
    }

    pub fn receive_message(&mut self, component: ComponentId) -> Result<Option<Message>, Error> {
        // メッセージの受信処理
    }

    pub fn register_handler(&mut self, component: ComponentId, handler: Box<dyn MessageHandler>) {
        // ハンドラの登録
    }
}
```

## 5. 通信パターン

### 5.1 同期通信
```rust
pub async fn request_response(
    &mut self,
    request: Message,
    timeout: Duration,
) -> Result<Message, Error> {
    self.send_message(request)?;
    tokio::time::timeout(timeout, self.receive_response()).await?
}
```

### 5.2 非同期通信
```rust
pub fn send_async(
    &mut self,
    message: Message,
    callback: Box<dyn Fn(Result<Message, Error>)>,
) {
    tokio::spawn(async move {
        // 非同期送信処理
    });
}
```

## 6. エラー処理
```rust
#[derive(Debug)]
pub enum MessagingError {
    SendError(String),
    ReceiveError(String),
    TimeoutError,
    ChannelFull,
    InvalidMessage,
    HandlerError(String),
}

impl MessagingSystem {
    pub fn handle_error(&self, error: MessagingError) -> Result<(), Error> {
        match error {
            MessagingError::SendError(msg) => {
                // エラーログの記録
                // リトライ処理
                // エラー通知
            }
            // ... 他のエラー処理
        }
        Ok(())
    }
}
```

## 7. パフォーマンス最適化

### 7.1 メッセージバッファリング
- チャネルバッファサイズの動的調整
- バックプレッシャーの実装
- メモリ使用量の監視と制御

### 7.2 データ転送最適化
```rust
impl MessagingSystem {
    pub fn optimize_transfer(&mut self, message: &mut Message) {
        match message.payload {
            MessagePayload::Data { ref mut format, .. } => {
                // データサイズに応じて最適な転送方式を選択
                if message.payload.size() > LARGE_MESSAGE_THRESHOLD {
                    *format = DataFormat::Binary;
                }
            }
            _ => {}
        }
    }
}
```

## 8. モニタリングと診断

### 8.1 メトリクス収集
```rust
#[derive(Debug)]
pub struct MessagingMetrics {
    pub messages_sent: AtomicUsize,
    pub messages_received: AtomicUsize,
    pub errors: AtomicUsize,
    pub average_latency: AtomicU64,
}

impl MessagingSystem {
    pub fn collect_metrics(&self) -> MessagingMetrics {
        // メトリクスの収集と集計
    }
}
```

### 8.2 診断機能
- メッセージフローの可視化
- ボトルネックの検出
- デッドロックの検出と防止

## 9. セキュリティ

### 9.1 メッセージの検証
```rust
impl MessagingSystem {
    fn validate_message(&self, message: &Message) -> Result<(), Error> {
        // メッセージの整合性チェック
        // 送信元の認証
        // ペイロードの検証
    }
}
```

### 9.2 アクセス制御
- コンポーネント間の通信制限
- メッセージフィルタリング
- 監査ログの記録

## 10. 拡張性

### 10.1 新規メッセージタイプの追加
```rust
// メッセージタイプの拡張例
#[derive(Debug, Clone)]
pub enum CustomMessageType {
    SpecialCommand { data: String },
}

impl MessagingSystem {
    pub fn register_message_type<T: MessageHandler + 'static>(&mut self, handler: T) {
        // 新しいメッセージタイプの登録
    }
}
```

### 10.2 プラグイン機能
- カスタムハンドラーの追加
- プロトコル拡張
- メッセージ変換機能
``` 