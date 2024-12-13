use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use time::OffsetDateTime;
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct History {
    pub id: String,
    pub project_id: String,
    pub element_id: String,
    pub change_type: String,
    pub old_value: Option<serde_json::Value>,
    pub new_value: Option<serde_json::Value>,
    pub timestamp: OffsetDateTime,
    pub user_id: String,
}

impl History {
    pub fn new(
        project_id: String,
        element_id: String,
        change_type: String,
        old_value: Option<serde_json::Value>,
        new_value: Option<serde_json::Value>,
        user_id: String,
    ) -> Self {
        Self {
            id: Uuid::new_v4().to_string(),
            project_id,
            element_id,
            change_type,
            old_value,
            new_value,
            timestamp: OffsetDateTime::now_utc(),
            user_id,
        }
    }
} 