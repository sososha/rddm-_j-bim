use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use time::OffsetDateTime;
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct Relationship {
    pub id: String,
    pub source_id: String,
    pub target_id: String,
    pub relationship_type: String,
    pub properties: Option<serde_json::Value>,
    pub created_at: OffsetDateTime,
}

#[derive(Debug, Deserialize)]
pub struct CreateRelationship {
    pub source_id: String,
    pub target_id: String,
    pub relationship_type: String,
    pub properties: Option<serde_json::Value>,
}

#[derive(Debug, Deserialize)]
pub struct UpdateRelationship {
    pub relationship_type: Option<String>,
    pub properties: Option<serde_json::Value>,
}

impl Relationship {
    pub fn new(
        source_id: String,
        target_id: String,
        relationship_type: String,
        properties: Option<serde_json::Value>,
    ) -> Self {
        Self {
            id: Uuid::new_v4().to_string(),
            source_id,
            target_id,
            relationship_type,
            properties,
            created_at: OffsetDateTime::now_utc(),
        }
    }
} 