use axum::{
    extract::{Path, State},
    Json,
};
use sqlx::SqlitePool;

use crate::{
    db,
    error::Result,
    models::project::{CreateProject, Project, UpdateProject},
    AppState,
};

pub async fn list_projects(
    State(state): State<AppState>,
) -> Result<Json<Vec<Project>>> {
    let projects = db::list_projects(&state.db).await?;
    Ok(Json(projects))
}

pub async fn get_project(
    State(state): State<AppState>,
    Path(id): Path<String>,
) -> Result<Json<Project>> {
    let project = db::get_project(&state.db, &id).await?;
    Ok(Json(project))
}

pub async fn create_project(
    State(state): State<AppState>,
    Json(data): Json<CreateProject>,
) -> Result<Json<Project>> {
    let project = db::create_project(&state.db, data).await?;
    Ok(Json(project))
}

pub async fn update_project(
    State(state): State<AppState>,
    Path(id): Path<String>,
    Json(data): Json<UpdateProject>,
) -> Result<Json<Project>> {
    let project = db::update_project(&state.db, &id, data).await?;
    Ok(Json(project))
}

pub async fn delete_project(
    State(state): State<AppState>,
    Path(id): Path<String>,
) -> Result<()> {
    db::delete_project(&state.db, &id).await
} 