# APIインターフェース設計

## 概要
統一データモデルのCRUD操作とリアルタイム同期を実現するためのREST APIとWebSocket APIの定義。

## REST API

### プロジェクト管理

#### 1. プロジェクト操作
```typescript
// プロジェクト作成
POST /api/projects
{
  name: string;
  description?: string;
}

// プロジェクト一覧取得
GET /api/projects

// プロジェクト詳細取得
GET /api/projects/:id

// プロジェクト更新
PUT /api/projects/:id
{
  name?: string;
  description?: string;
}

// プロジェクト削除
DELETE /api/projects/:id
```

### 要素管理

#### 1. 要素操作
```typescript
// 要素作成
POST /api/projects/:projectId/elements
{
  type: ElementType;
  geometry: Geometry;
  properties: Properties;
  metadata: Metadata;
}

// 要素一覧取得
GET /api/projects/:projectId/elements
Query Parameters:
  - type?: ElementType
  - updatedAfter?: ISO8601DateTime
  - limit?: number
  - offset?: number

// 要素詳細取得
GET /api/projects/:projectId/elements/:elementId

// 要素更新
PUT /api/projects/:projectId/elements/:elementId
{
  type?: ElementType;
  geometry?: Geometry;
  properties?: Properties;
  metadata?: Metadata;
}

// 要素削除
DELETE /api/projects/:projectId/elements/:elementId
```

#### 2. 要素関係操作
```typescript
// 関係性作成
POST /api/projects/:projectId/relationships
{
  sourceId: string;
  targetId: string;
  type: string;
  properties?: object;
}

// 関係性取得
GET /api/projects/:projectId/relationships
Query Parameters:
  - elementId?: string
  - type?: string

// 関係性更新
PUT /api/projects/:projectId/relationships/:relationshipId
{
  type?: string;
  properties?: object;
}

// 関係性削除
DELETE /api/projects/:projectId/relationships/:relationshipId
```

### ビュー管理

#### 1. ビュー操作
```typescript
// ビュー作成/更新
PUT /api/projects/:projectId/views/:viewType
{
  state: {
    visibilityRules: Map<ElementType, boolean>;
    styleRules: Map<ElementType, Style>;
    renderingRules: Map<ElementType, RenderRule>;
  }
}

// ビュー取得
GET /api/projects/:projectId/views/:viewType

// ビュー一覧取得
GET /api/projects/:projectId/views
```

### 変更履歴

#### 1. 履歴操作
```typescript
// 変更履歴取得
GET /api/projects/:projectId/history
Query Parameters:
  - elementId?: string
  - fromTimestamp?: ISO8601DateTime
  - toTimestamp?: ISO8601DateTime
  - limit?: number
  - offset?: number
```

## WebSocket API

### 1. 接続確立
```typescript
// WebSocket接続
WS /ws/projects/:projectId
```

### 2. メッセージ型
```typescript
interface WebSocketMessage {
  type: 'element_update' | 'element_delete' | 'relationship_update' | 'relationship_delete';
  payload: {
    id: string;
    projectId: string;
    data?: any;
    timestamp: string;
    userId: string;
  };
}
```

### 3. イベント
```typescript
// 要素更新通知
{
  type: 'element_update',
  payload: {
    id: string;
    projectId: string;
    data: {
      type: ElementType;
      geometry: Geometry;
      properties: Properties;
    };
    timestamp: string;
    userId: string;
  }
}

// 要素削除通知
{
  type: 'element_delete',
  payload: {
    id: string;
    projectId: string;
    timestamp: string;
    userId: string;
  }
}

// 関係性更新通知
{
  type: 'relationship_update',
  payload: {
    id: string;
    projectId: string;
    data: {
      sourceId: string;
      targetId: string;
      type: string;
      properties: object;
    };
    timestamp: string;
    userId: string;
  }
}
```

## エラーハンドリング

### 1. HTTPエラーレスポンス
```typescript
interface ErrorResponse {
  error: {
    code: string;
    message: string;
    details?: object;
  };
}
```

### 2. エラーコード
```typescript
enum ErrorCode {
  INVALID_REQUEST = 'INVALID_REQUEST',
  NOT_FOUND = 'NOT_FOUND',
  CONFLICT = 'CONFLICT',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN'
}
```

## レート制限
- API呼び出し: 1000回/分/クライアント
- WebSocket接続: 10接続/クライアント
- WebSocketメッセージ: 100メッセージ/秒/接続

## セキュリティ
1. 認証: Bearer Token
2. CORS設定
3. WebSocket接続認証
4. 入力バリデーション
5. レート制限

## パフォーマンス最適化
1. ページネーション
2. 条件付きリクエスト
3. 部分更新
4. バッチ操作
``` 