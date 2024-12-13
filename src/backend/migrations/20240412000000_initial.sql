-- プロジェクトテーブル
CREATE TABLE projects (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    version INTEGER NOT NULL DEFAULT 1
);

-- 要素テーブル
CREATE TABLE elements (
    id TEXT PRIMARY KEY,
    project_id TEXT NOT NULL,
    type TEXT NOT NULL,
    geometry JSON NOT NULL,
    properties JSON NOT NULL,
    metadata JSON NOT NULL,
    version INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

-- ビューテーブル
CREATE TABLE views (
    id TEXT PRIMARY KEY,
    project_id TEXT NOT NULL,
    type TEXT NOT NULL,
    state JSON NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

-- 要素関係テーブル
CREATE TABLE element_relationships (
    id TEXT PRIMARY KEY,
    source_id TEXT NOT NULL,
    target_id TEXT NOT NULL,
    type TEXT NOT NULL,
    properties JSON,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (source_id) REFERENCES elements(id) ON DELETE CASCADE,
    FOREIGN KEY (target_id) REFERENCES elements(id) ON DELETE CASCADE
);

-- 変更履歴テーブル
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

-- インデックス
CREATE INDEX idx_elements_project ON elements(project_id);
CREATE INDEX idx_elements_type ON elements(type);
CREATE INDEX idx_views_project ON views(project_id);
CREATE INDEX idx_views_type ON views(type);
CREATE INDEX idx_relationships_source ON element_relationships(source_id);
CREATE INDEX idx_relationships_target ON element_relationships(target_id);
CREATE INDEX idx_history_project ON change_history(project_id);
CREATE INDEX idx_history_element ON change_history(element_id);
CREATE INDEX idx_history_timestamp ON change_history(timestamp); 