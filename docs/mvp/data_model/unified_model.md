# 統一データモデル設計

## 概要
異なるビュー（間取り図、構造図、意匠図）間でリアルタイム同期を実現するための統一データモデル設計。

## 設計方針
1. 単一ソース原則（Single Source of Truth）
   - すべてのビューは同一のデータソースを参照
   - データ変換を排除し、即時性を確保

2. レイヤー構造
   - 基本図形レイヤー（共通）
   - ビュー固有の表現レイヤー
   - アノテーションレイヤー

3. リアルタイム同期
   - WebSocketによる双方向通信
   - 差分更新による効率的な同期

## データ構造

### 1. 基本要素（BaseElement）
```typescript
interface BaseElement {
  id: string;                 // 一意のID
  type: ElementType;          // 要素タイプ（壁、開口部、柱など）
  geometry: Geometry;         // 基本形状データ
  properties: Properties;     // 共通プロパティ
  metadata: Metadata;         // メタデータ
  version: number;           // 変更追跡用バージョン
}
```

### 2. ジオメトリ（Geometry）
```typescript
interface Geometry {
  points: Point[];           // 頂点座標
  bounds: BoundingBox;       // バウンディングボックス
  transform: Transform;      // 変換行列
}
```

### 3. プロパティ（Properties）
```typescript
interface Properties {
  common: {                  // 共通プロパティ
    name: string;
    layer: string;
    visible: boolean;
    locked: boolean;
  };
  floorPlan?: {             // 間取り図固有
    roomType: string;
    area: number;
  };
  structural?: {            // 構造図固有
    structureType: string;
    load: number;
  };
  architectural?: {         // 意匠図固有
    material: string;
    finish: string;
  };
}
```

### 4. メタデータ（Metadata）
```typescript
interface Metadata {
  created: Date;
  modified: Date;
  author: string;
  version: string;
  status: string;
}
```

## ビュー管理

### 1. ビューマネージャー
```typescript
interface ViewManager {
  activeView: ViewType;
  viewStates: Map<ViewType, ViewState>;
  updateElement(element: BaseElement): void;
  synchronizeViews(): void;
}
```

### 2. ビュー固有の状態
```typescript
interface ViewState {
  visibilityRules: Map<ElementType, boolean>;
  styleRules: Map<ElementType, Style>;
  renderingRules: Map<ElementType, RenderRule>;
}
```

## 同期メカニズム

### 1. 変更通知
```typescript
interface ChangeNotification {
  elementId: string;
  changeType: ChangeType;
  payload: any;
  timestamp: number;
}
```

### 2. 同期フロー
1. 要素の変更検知
2. 変更通知の生成
3. WebSocket���よる配信
4. 各ビューの更新
5. UI再描画

## パフォーマンス最適化
1. 差分更新
2. バッチ処理
3. メモ化
4. 仮想化

## エラー処理
1. 整合性チェック
2. 競合解決
3. ロールバック機能

## 拡張性
1. プラグイン機構
2. カスタムプロパティ
3. カスタムレンダリングルール
``` 