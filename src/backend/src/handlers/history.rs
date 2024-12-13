use axum::{
    extract::{Path, Query, State},
    Json,
};
use serde::Deserialize;

use crate::{
    db,
    error::Result,
    models::history::History,
    AppState,
};

#[derive(Debug, Deserialize)]
pub struct HistoryQuery {
    element_id: Option<String>,
    limit: Option<i64>,
}

pub async fn get_history(
    State(state): State<AppState>,
    Path(project_id): Path<String>,
    Query(query): Query<HistoryQuery>,
) -> Result<Json<Vec<History>>> {
    let history = db::list_history(
        &state.db,
        &project_id,
        query.element_id.as_deref(),
        query.limit,
    )
    .await?;
    Ok(Json(history))
}

pub async fn clear_history(
    State(state): State<AppState>,
    Path(project_id): Path<String>,
) -> Result<()> {
    db::clear_history(&state.db, &project_id).await
} 