use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use time::OffsetDateTime;
use uuid::Uuid;
use serde_json::Value as JsonValue;

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Geometry {
    pub x: f64,
    pub y: f64,
    pub width: f64,
    pub height: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Properties {
    pub common: CommonProperties,
    pub floor_plan: Option<FloorPlanProperties>,
    pub structural: Option<StructuralProperties>,
    pub architectural: Option<ArchitecturalProperties>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CommonProperties {
    pub name: String,
    pub layer: String,
    pub visible: bool,
    pub locked: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct FloorPlanProperties {
    pub room_type: Option<String>,
    pub area: Option<f64>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct StructuralProperties {
    pub structure_type: Option<String>,
    pub load: Option<f64>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ArchitecturalProperties {
    pub material: Option<String>,
    pub finish: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Metadata {
    pub created: OffsetDateTime,
    pub modified: OffsetDateTime,
    pub author: String,
    pub version: String,
    pub status: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Element {
    pub id: String,
    pub project_id: String,
    pub element_type: String,
    pub geometry: JsonValue,
    pub properties: JsonValue,
    pub metadata: JsonValue,
    pub version: i32,
    pub created_at: OffsetDateTime,
    pub updated_at: OffsetDateTime,
}

#[derive(Debug, Deserialize)]
pub struct CreateElement {
    pub element_type: String,
    pub geometry: Geometry,
    pub properties: Properties,
    pub metadata: Metadata,
}

#[derive(Debug, Deserialize)]
pub struct UpdateElement {
    pub element_type: Option<String>,
    pub geometry: Option<Geometry>,
    pub properties: Option<Properties>,
    pub metadata: Option<Metadata>,
}

impl Element {
    pub fn new(
        project_id: String,
        element_type: String,
        geometry: Geometry,
        properties: Properties,
        metadata: Metadata,
    ) -> Self {
        let now = OffsetDateTime::now_utc();
        Self {
            id: Uuid::new_v4().to_string(),
            project_id,
            element_type,
            geometry: serde_json::to_value(geometry).unwrap(),
            properties: serde_json::to_value(properties).unwrap(),
            metadata: serde_json::to_value(metadata).unwrap(),
            version: 1,
            created_at: now,
            updated_at: now,
        }
    }
} 