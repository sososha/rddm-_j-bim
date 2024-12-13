use axum::{
    extract::{Path, State},
    Json,
};
use time::OffsetDateTime;

use crate::{
    db,
    error::Result,
    models::element::{CreateElement, Element, UpdateElement},
    websocket::WebSocketMessage,
    AppState,
};

pub async fn list_elements(
    State(state): State<AppState>,
    Path(project_id): Path<String>,
) -> Result<Json<Vec<Element>>> {
    let elements = db::list_elements(&state.db, &project_id).await?;
    Ok(Json(elements))
}

pub async fn get_element(
    State(state): State<AppState>,
    Path((project_id, element_id)): Path<(String, String)>,
) -> Result<Json<Element>> {
    let element = db::get_element(&state.db, &project_id, &element_id).await?;
    Ok(Json(element))
}

pub async fn create_element(
    State(state): State<AppState>,
    Path(project_id): Path<String>,
    Json(data): Json<CreateElement>,
) -> Result<Json<Element>> {
    let element = db::create_element(&state.db, &project_id, data).await?;

    // WebSocketで通知
    let msg = WebSocketMessage::ElementUpdate {
        id: element.id.clone(),
        project_id: project_id.clone(),
        data: serde_json::to_value(&element)?,
        timestamp: OffsetDateTime::now_utc().to_string(),
        user_id: "system".to_string(), // TODO: 実際のユーザーIDを使用
    };

    let tx = state.ws_manager.get_or_create_channel(&project_id);
    let _ = tx.send(msg);

    Ok(Json(element))
}

pub async fn update_element(
    State(state): State<AppState>,
    Path((project_id, element_id)): Path<(String, String)>,
    Json(data): Json<UpdateElement>,
) -> Result<Json<Element>> {
    let element = db::update_element(&state.db, &project_id, &element_id, data).await?;

    // WebSocketで通知
    let msg = WebSocketMessage::ElementUpdate {
        id: element_id.clone(),
        project_id: project_id.clone(),
        data: serde_json::to_value(&element)?,
        timestamp: OffsetDateTime::now_utc().to_string(),
        user_id: "system".to_string(), // TODO: 実際のユーザーIDを使用
    };

    let tx = state.ws_manager.get_or_create_channel(&project_id);
    let _ = tx.send(msg);

    Ok(Json(element))
}

pub async fn delete_element(
    State(state): State<AppState>,
    Path((project_id, element_id)): Path<(String, String)>,
) -> Result<()> {
    db::delete_element(&state.db, &project_id, &element_id).await?;

    // WebSocketで通知
    let msg = WebSocketMessage::ElementDelete {
        id: element_id.clone(),
        project_id: project_id.clone(),
        timestamp: OffsetDateTime::now_utc().to_string(),
        user_id: "system".to_string(), // TODO: 実際のユーザーIDを使用
    };

    let tx = state.ws_manager.get_or_create_channel(&project_id);
    let _ = tx.send(msg);

    Ok(())
} 