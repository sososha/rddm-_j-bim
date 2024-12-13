# データベーススキーマ設計

## 概要
統一データモデルを永続化するためのデータベーススキーマ設計。SQLiteを使用し、効率的なクエリと整合性を確保する。

## テーブル構造

### 1. projects
```sql
CREATE TABLE projects (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    version INTEGER NOT NULL DEFAULT 1
);
```

### 2. elements
```sql
CREATE TABLE elements (
    id TEXT PRIMARY KEY,
    project_id TEXT NOT NULL,
    type TEXT NOT NULL,  -- 'wall', 'opening', 'column', etc.
    geometry JSON NOT NULL,  -- points, bounds, transform
    properties JSON NOT NULL,  -- common, floorPlan, structural, architectural
    metadata JSON NOT NULL,
    version INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);
```

### 3. views
```sql
CREATE TABLE views (
    id TEXT PRIMARY KEY,
    project_id TEXT NOT NULL,
    type TEXT NOT NULL,  -- 'floorPlan', 'structural', 'architectural'
    state JSON NOT NULL,  -- visibilityRules, styleRules, renderingRules
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);
```

### 4. element_relationships
```sql
CREATE TABLE element_relationships (
    id TEXT PRIMARY KEY,
    source_id TEXT NOT NULL,
    target_id TEXT NOT NULL,
    type TEXT NOT NULL,  -- 'contains', 'connects', 'supports', etc.
    properties JSON,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (source_id) REFERENCES elements(id) ON DELETE CASCADE,
    FOREIGN KEY (target_id) REFERENCES elements(id) ON DELETE CASCADE
);
```

### 5. change_history
```sql
CREATE TABLE change_history (
    id TEXT PRIMARY KEY,
    project_id TEXT NOT NULL,
    element_id TEXT NOT NULL,
    change_type TEXT NOT NULL,
    old_value JSON,
    new_value JSON,
    timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    user_id TEXT NOT NULL,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (element_id) REFERENCES elements(id) ON DELETE CASCADE
);
```

## インデックス

```sql
-- 要素の高速検索用
CREATE INDEX idx_elements_project ON elements(project_id);
CREATE INDEX idx_elements_type ON elements(type);

-- ビューの高速検索用
CREATE INDEX idx_views_project ON views(project_id);
CREATE INDEX idx_views_type ON views(type);

-- 関係性の���速検索用
CREATE INDEX idx_relationships_source ON element_relationships(source_id);
CREATE INDEX idx_relationships_target ON element_relationships(target_id);

-- 変更履歴の高速検索用
CREATE INDEX idx_history_project ON change_history(project_id);
CREATE INDEX idx_history_element ON change_history(element_id);
CREATE INDEX idx_history_timestamp ON change_history(timestamp);
```

## トリガー

### 1. 更新日時の自動更新
```sql
CREATE TRIGGER update_project_timestamp
AFTER UPDATE ON projects
BEGIN
    UPDATE projects SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE TRIGGER update_element_timestamp
AFTER UPDATE ON elements
BEGIN
    UPDATE elements SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;
```

### 2. バージョン管理
```sql
CREATE TRIGGER increment_project_version
AFTER UPDATE ON projects
BEGIN
    UPDATE projects SET version = version + 1 WHERE id = NEW.id;
END;

CREATE TRIGGER increment_element_version
AFTER UPDATE ON elements
BEGIN
    UPDATE elements SET version = version + 1 WHERE id = NEW.id;
END;
```

## データ整合性

### 1. 制約
- プロジェクトIDは必須
- 要素タイプは定義済みの値のみ許可
- ジオメトリとプロパティは有効なJSON
- タイムスタンプは自動設定

### 2. カスケード削��
- プロジェクト削除時に関連する全てのデータを削除
- 要素削除時に関連する関係性と変更履歴を削除

## クエリ最適化

### 1. よく使用されるクエリ
```sql
-- プロジェクト内の全要素を取得
SELECT * FROM elements WHERE project_id = ? ORDER BY updated_at DESC;

-- 特定タイプの要素を取得
SELECT * FROM elements WHERE project_id = ? AND type = ?;

-- 要素の関係性を取得
SELECT * FROM element_relationships 
WHERE source_id = ? OR target_id = ?;

-- 変更履歴の取得
SELECT * FROM change_history 
WHERE project_id = ? 
ORDER BY timestamp DESC 
LIMIT 100;
```

### 2. ビュー
```sql
-- 最近の変更要約
CREATE VIEW recent_changes AS
SELECT 
    p.name as project_name,
    e.type as element_type,
    ch.change_type,
    ch.timestamp,
    ch.user_id
FROM change_history ch
JOIN projects p ON ch.project_id = p.id
JOIN elements e ON ch.element_id = e.id
ORDER BY ch.timestamp DESC;
```

## バックアップと復元
1. 定期的なバックアップ
2. ポイントインタイムリカバリ
3. トランザクションログ

## 拡張性
1. 新しい要素タイプの追加
2. プロパティの拡張
3. 関係性タイプの追加
``` 