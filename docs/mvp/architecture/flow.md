# データフロー図

## 概要
RDDMシステムのデータの流れとその処理の定義。

## システム全体のデータフロー

### 1. メインフロー
```mermaid
graph TD
    User[ユーザー] --> |1. 操作| UI[UIレイヤー]
    UI --> |2. アクション| State[状態管理]
    State --> |3. 状態更新| Core[コアロジック]
    Core --> |4. API呼び出し| Network[ネットワーク]
    Network --> |5. HTTP/WS| Backend[バックエンド]
    Backend --> |6. CRUD| DB[(データベース)]
    Backend --> |7. 応答| Network
    Network --> |8. 状態同期| State
    State --> |9. 再描画| UI
    UI --> |10. 表示| User
```

## 詳細フロー

### 1. 要素作成フロー
```mermaid
sequenceDiagram
    actor User
    participant UI
    participant State
    participant Core
    participant API
    participant DB
    
    User->>UI: 要素作成操作
    UI->>State: アクション発行
    State->>Core: 要素作成要求
    Core->>API: POST /api/elements
    API->>DB: INSERT
    DB-->>API: 成功
    API-->>Core: 要素ID
    Core-->>State: 状態更新
    State-->>UI: 再描画
    UI-->>User: フィードバック
```

### 2. リアルタイム同期フロー
```mermaid
sequenceDiagram
    participant Client1
    participant WS
    participant Backend
    participant Client2
    
    Client1->>Backend: 要素更新
    Backend->>WS: 更新イベント
    WS->>Client2: 更新通知
    Client2->>Client2: 状態更新
```

### 3. ビュー切替フロー
```mermaid
sequenceDiagram
    actor User
    participant UI
    participant State
    participant ViewManager
    participant Renderer
    
    User->>UI: ビュー切替
    UI->>State: ビュー変更
    State->>ViewManager: ビュー状態取得
    ViewManager->>Renderer: レンダリング設定
    Renderer-->>UI: 新ビュー表示
    UI-->>User: 完了
```

## データ変換フロー

### 1. 間取り図→構造図変換
```mermaid
graph TD
    Floor[間取り図データ] --> Extract[要素抽出]
    Extract --> Transform[構造要素変換]
    Transform --> Generate[構造図生成]
    Generate --> Validate[整合性検証]
```

### 2. 構造図→意匠図変換
```mermaid
graph TD
    Structure[構造図データ] --> Extract[要素抽出]
    Extract --> Transform[意匠要素変換]
    Transform --> Generate[意匠図生成]
    Generate --> Validate[整合性検証]
```

## 状態管理フロー

### 1. グローバル状態
```mermaid
graph TD
    Action[アクション] --> Reducer[リデューサー]
    Reducer --> Store[ストア]
    Store --> Selector[セレクター]
    Selector --> Component[コンポーネント]
```

### 2. エディタ状態
```mermaid
graph TD
    Tool[ツール選択] --> Mode[編集モード]
    Mode --> Operation[操作]
    Operation --> History[履歴]
    History --> Undo[元に戻す/やり直し]
```

## データ永続化フロー

### 1. 保存フロー
```mermaid
sequenceDiagram
    participant UI
    participant API
    participant DB
    participant Storage
    
    UI->>API: 保存要求
    API->>DB: プロジェクトデータ保存
    API->>Storage: 関連ファイル保存
    Storage-->>API: 保存完了
    DB-->>API: 保存完了
    API-->>UI: 完了通知
```

### 2. 読み込みフロー
```mermaid
sequenceDiagram
    participant UI
    participant API
    participant DB
    participant Storage
    
    UI->>API: 読み込み要求
    API->>DB: プロジェクトデータ取得
    API->>Storage: 関連ファイル取得
    Storage-->>API: ファイル
    DB-->>API: データ
    API-->>UI: 完了通知
```

## エラーフロー

### 1. バリデーションエラー
```mermaid
sequenceDiagram
    participant UI
    participant Validator
    participant ErrorHandler
    
    UI->>Validator: データ検証
    Validator->>ErrorHandler: エラー検出
    ErrorHandler->>UI: エラー表示
```

### 2. 同期エラー
```mermaid
sequenceDiagram
    participant Client
    participant WS
    participant ErrorHandler
    
    Client->>WS: 同期要求
    WS->>ErrorHandler: 接続エラー
    ErrorHandler->>Client: 再接続処理
```

## キャッシュフロー

### 1. データキャッシュ
```mermaid
graph TD
    Request[リクエスト] --> Cache[キャッシュ確認]
    Cache --> |ヒット| Return[キャッシュ返却]
    Cache --> |ミス| Fetch[データ取得]
    Fetch --> Store[キャッシュ保存]
    Store --> Return
```

### 2. レンダリングキャッシュ
```mermaid
graph TD
    View[ビュー更新] --> Check[キャッシュ確認]
    Check --> |変更なし| Use[キャッシュ使用]
    Check --> |変更あり| Render[再レンダリング]
    Render --> Store[キャッシュ保存]
```

## パフォーマンス最適化フロー

### 1. バッチ処理
```mermaid
sequenceDiagram
    participant UI
    participant Queue
    participant Processor
    participant API
    
    UI->>Queue: 更新キュー
    Queue->>Processor: バッチ処理
    Processor->>API: 一括更新
```

### 2. 遅延読み込み
```mermaid
graph TD
    Initial[初期表示] --> Essential[必須データ]
    Essential --> Visible[表示領域]
    Visible --> Background[バックグラウンド]
```

## セキュリティフロー

### 1. 認証フロー
```mermaid
sequenceDiagram
    participant User
    participant Auth
    participant API
    participant Token
    
    User->>Auth: ログイン
    Auth->>API: 認証要求
    API->>Token: トークン生成
    Token-->>Auth: JWT
    Auth-->>User: 認証完了
```

### 2. 権限チェック
```mermaid
graph TD
    Request[リクエスト] --> Token[トークン検証]
    Token --> Role[ロール確認]
    Role --> Permission[権限確認]
    Permission --> Allow[許可/拒否]
``` 