use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use time::OffsetDateTime;
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ViewState {
    pub visibility_rules: serde_json::Value,
    pub style_rules: serde_json::Value,
    pub rendering_rules: serde_json::Value,
}

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct View {
    pub id: String,
    pub project_id: String,
    pub view_type: String,
    pub state: serde_json::Value,
    pub created_at: OffsetDateTime,
    pub updated_at: OffsetDateTime,
}

#[derive(Debug, Deserialize)]
pub struct UpdateView {
    pub state: ViewState,
}

impl View {
    pub fn new(project_id: String, view_type: String, state: ViewState) -> Self {
        let now = OffsetDateTime::now_utc();
        Self {
            id: Uuid::new_v4().to_string(),
            project_id,
            view_type,
            state: serde_json::to_value(state).unwrap(),
            created_at: now,
            updated_at: now,
        }
    }
} 