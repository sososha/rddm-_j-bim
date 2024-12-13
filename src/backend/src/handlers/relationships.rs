use axum::{
    extract::{Path, State},
    Json,
};
use time::OffsetDateTime;

use crate::{
    db,
    error::Result,
    models::relationship::{CreateRelationship, Relationship, UpdateRelationship},
    websocket::WebSocketMessage,
    AppState,
};

pub async fn list_relationships(
    State(state): State<AppState>,
    Path(element_id): Path<String>,
) -> Result<Json<Vec<Relationship>>> {
    let relationships = db::list_relationships(&state.db, &element_id).await?;
    Ok(Json(relationships))
}

pub async fn create_relationship(
    State(state): State<AppState>,
    Path(project_id): Path<String>,
    Json(data): Json<CreateRelationship>,
) -> Result<Json<Relationship>> {
    let relationship = db::create_relationship(&state.db, data).await?;

    // WebSocketで通知
    let msg = WebSocketMessage::RelationshipUpdate {
        id: relationship.id.clone(),
        project_id: project_id.clone(),
        data: serde_json::to_value(&relationship)?,
        timestamp: OffsetDateTime::now_utc().to_string(),
        user_id: "system".to_string(), // TODO: 実際のユーザーIDを使用
    };

    let tx = state.ws_manager.get_or_create_channel(&project_id);
    let _ = tx.send(msg);

    Ok(Json(relationship))
}

pub async fn update_relationship(
    State(state): State<AppState>,
    Path((project_id, relationship_id)): Path<(String, String)>,
    Json(data): Json<UpdateRelationship>,
) -> Result<Json<Relationship>> {
    let relationship = db::update_relationship(&state.db, &relationship_id, data).await?;

    // WebSocketで通知
    let msg = WebSocketMessage::RelationshipUpdate {
        id: relationship_id.clone(),
        project_id: project_id.clone(),
        data: serde_json::to_value(&relationship)?,
        timestamp: OffsetDateTime::now_utc().to_string(),
        user_id: "system".to_string(), // TODO: 実際のユーザーIDを使用
    };

    let tx = state.ws_manager.get_or_create_channel(&project_id);
    let _ = tx.send(msg);

    Ok(Json(relationship))
}

pub async fn delete_relationship(
    State(state): State<AppState>,
    Path((project_id, relationship_id)): Path<(String, String)>,
) -> Result<()> {
    db::delete_relationship(&state.db, &relationship_id).await?;

    // WebSocketで通知
    let msg = WebSocketMessage::RelationshipDelete {
        id: relationship_id.clone(),
        project_id: project_id.clone(),
        timestamp: OffsetDateTime::now_utc().to_string(),
        user_id: "system".to_string(), // TODO: 実際のユーザーIDを使用
    };

    let tx = state.ws_manager.get_or_create_channel(&project_id);
    let _ = tx.send(msg);

    Ok(())
} 