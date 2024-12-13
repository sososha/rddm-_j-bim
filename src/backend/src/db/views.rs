use sqlx::{Row, SqlitePool};
use serde_json::Value as JsonValue;

use crate::{
    error::{AppError, Result},
    models::view::{UpdateView, View, ViewState},
};

pub async fn list_views(pool: &SqlitePool, project_id: &str) -> Result<Vec<View>> {
    let rows = sqlx::query(
        r#"
        SELECT id, project_id, view_type, state, created_at, updated_at
        FROM views
        WHERE project_id = ?
        ORDER BY created_at ASC
        "#
    )
    .bind(project_id)
    .fetch_all(pool)
    .await
    .map_err(AppError::Database)?;

    let views = rows
        .iter()
        .map(|row| View {
            id: row.get("id"),
            project_id: row.get("project_id"),
            view_type: row.get("view_type"),
            state: row.get::<JsonValue, _>("state"),
            created_at: row.get("created_at"),
            updated_at: row.get("updated_at"),
        })
        .collect();

    Ok(views)
}

pub async fn get_view(pool: &SqlitePool, project_id: &str, view_type: &str) -> Result<View> {
    let row = sqlx::query(
        r#"
        SELECT id, project_id, view_type, state, created_at, updated_at
        FROM views
        WHERE project_id = ? AND view_type = ?
        "#
    )
    .bind(project_id)
    .bind(view_type)
    .fetch_optional(pool)
    .await
    .map_err(AppError::Database)?
    .ok_or_else(|| {
        AppError::NotFound(format!(
            "View not found: {} for project {}",
            view_type, project_id
        ))
    })?;

    Ok(View {
        id: row.get("id"),
        project_id: row.get("project_id"),
        view_type: row.get("view_type"),
        state: row.get::<JsonValue, _>("state"),
        created_at: row.get("created_at"),
        updated_at: row.get("updated_at"),
    })
}

pub async fn create_view(
    pool: &SqlitePool,
    project_id: &str,
    view_type: &str,
    state: ViewState,
) -> Result<View> {
    let view = View::new(project_id.to_string(), view_type.to_string(), state);

    sqlx::query(
        r#"
        INSERT INTO views (id, project_id, view_type, state, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?)
        "#
    )
    .bind(&view.id)
    .bind(&view.project_id)
    .bind(&view.view_type)
    .bind(&view.state)
    .bind(view.created_at)
    .bind(view.updated_at)
    .execute(pool)
    .await
    .map_err(AppError::Database)?;

    Ok(view)
}

pub async fn update_view(
    pool: &SqlitePool,
    project_id: &str,
    view_type: &str,
    data: UpdateView,
) -> Result<View> {
    let state = serde_json::to_value(data.state).map_err(|e| {
        AppError::InvalidRequest(format!("Failed to serialize view state: {}", e))
    })?;

    sqlx::query(
        r#"
        UPDATE views
        SET state = ?, updated_at = CURRENT_TIMESTAMP
        WHERE project_id = ? AND view_type = ?
        "#
    )
    .bind(&state)
    .bind(project_id)
    .bind(view_type)
    .execute(pool)
    .await
    .map_err(AppError::Database)?;

    get_view(pool, project_id, view_type).await
}

pub async fn delete_view(pool: &SqlitePool, project_id: &str, view_type: &str) -> Result<()> {
    let result = sqlx::query(
        r#"
        DELETE FROM views
        WHERE project_id = ? AND view_type = ?
        "#
    )
    .bind(project_id)
    .bind(view_type)
    .execute(pool)
    .await
    .map_err(AppError::Database)?;

    if result.rows_affected() == 0 {
        return Err(AppError::NotFound(format!(
            "View not found: {} for project {}",
            view_type, project_id
        )));
    }

    Ok(())
} 