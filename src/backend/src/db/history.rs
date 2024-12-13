use sqlx::{Row, SqlitePool};
use serde_json::Value as JsonValue;

use crate::{
    error::{AppError, Result},
    models::history::History,
};

pub async fn list_history(
    pool: &SqlitePool,
    project_id: &str,
    element_id: Option<&str>,
    limit: Option<i64>,
) -> Result<Vec<History>> {
    let limit = limit.unwrap_or(100);
    
    let rows = if let Some(element_id) = element_id {
        sqlx::query(
            r#"
            SELECT id, project_id, element_id, change_type, old_value, new_value, timestamp, user_id
            FROM change_history
            WHERE project_id = ? AND element_id = ?
            ORDER BY timestamp DESC
            LIMIT ?
            "#
        )
        .bind(project_id)
        .bind(element_id)
        .bind(limit)
        .fetch_all(pool)
        .await
    } else {
        sqlx::query(
            r#"
            SELECT id, project_id, element_id, change_type, old_value, new_value, timestamp, user_id
            FROM change_history
            WHERE project_id = ?
            ORDER BY timestamp DESC
            LIMIT ?
            "#
        )
        .bind(project_id)
        .bind(limit)
        .fetch_all(pool)
        .await
    }
    .map_err(AppError::Database)?;

    let history = rows
        .iter()
        .map(|row| History {
            id: row.get("id"),
            project_id: row.get("project_id"),
            element_id: row.get("element_id"),
            change_type: row.get("change_type"),
            old_value: row.get::<Option<JsonValue>, _>("old_value"),
            new_value: row.get::<Option<JsonValue>, _>("new_value"),
            timestamp: row.get("timestamp"),
            user_id: row.get("user_id"),
        })
        .collect();

    Ok(history)
}

pub async fn add_history_entry(
    pool: &SqlitePool,
    project_id: &str,
    element_id: &str,
    change_type: &str,
    old_value: Option<JsonValue>,
    new_value: Option<JsonValue>,
    user_id: &str,
) -> Result<History> {
    let history = History::new(
        project_id.to_string(),
        element_id.to_string(),
        change_type.to_string(),
        old_value,
        new_value,
        user_id.to_string(),
    );

    sqlx::query(
        r#"
        INSERT INTO change_history (
            id, project_id, element_id, change_type,
            old_value, new_value, timestamp, user_id
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        "#
    )
    .bind(&history.id)
    .bind(&history.project_id)
    .bind(&history.element_id)
    .bind(&history.change_type)
    .bind(&history.old_value)
    .bind(&history.new_value)
    .bind(history.timestamp)
    .bind(&history.user_id)
    .execute(pool)
    .await
    .map_err(AppError::Database)?;

    Ok(history)
}

pub async fn clear_history(pool: &SqlitePool, project_id: &str) -> Result<()> {
    sqlx::query(
        r#"
        DELETE FROM change_history
        WHERE project_id = ?
        "#
    )
    .bind(project_id)
    .execute(pool)
    .await
    .map_err(AppError::Database)?;

    Ok(())
} 