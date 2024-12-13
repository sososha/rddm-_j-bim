use axum::{
    extract::{Path, State},
    Json,
};
use time::OffsetDateTime;

use crate::{
    db,
    error::Result,
    models::view::{UpdateView, View},
    websocket::WebSocketMessage,
    AppState,
};

pub async fn list_views(
    State(state): State<AppState>,
    Path(project_id): Path<String>,
) -> Result<Json<Vec<View>>> {
    let views = db::list_views(&state.db, &project_id).await?;
    Ok(Json(views))
}

pub async fn get_view(
    State(state): State<AppState>,
    Path((project_id, view_type)): Path<(String, String)>,
) -> Result<Json<View>> {
    let view = db::get_view(&state.db, &project_id, &view_type).await?;
    Ok(Json(view))
}

pub async fn update_view(
    State(state): State<AppState>,
    Path((project_id, view_type)): Path<(String, String)>,
    Json(data): Json<UpdateView>,
) -> Result<Json<View>> {
    let view = db::update_view(&state.db, &project_id, &view_type, data).await?;

    // WebSocketで通知
    let msg = WebSocketMessage::ViewUpdate {
        project_id: project_id.clone(),
        view_type: view_type.clone(),
        data: serde_json::to_value(&view)?,
        timestamp: OffsetDateTime::now_utc().to_string(),
        user_id: "system".to_string(), // TODO: 実際のユーザーIDを使用
    };

    let tx = state.ws_manager.get_or_create_channel(&project_id);
    let _ = tx.send(msg);

    Ok(Json(view))
} 