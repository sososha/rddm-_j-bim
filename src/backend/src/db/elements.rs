use sqlx::{Row, SqlitePool};
use serde_json::Value as JsonValue;

use crate::{
    error::{AppError, Result},
    models::element::{CreateElement, Element, UpdateElement},
};

pub async fn list_elements(pool: &SqlitePool, project_id: &str) -> Result<Vec<Element>> {
    let rows = sqlx::query(
        r#"
        SELECT id, project_id, element_type, geometry, properties, metadata, version, created_at, updated_at
        FROM elements
        WHERE project_id = ?
        ORDER BY created_at ASC
        "#
    )
    .bind(project_id)
    .fetch_all(pool)
    .await
    .map_err(AppError::Database)?;

    let elements = rows
        .iter()
        .map(|row| Element {
            id: row.get("id"),
            project_id: row.get("project_id"),
            element_type: row.get("element_type"),
            geometry: row.get::<JsonValue, _>("geometry"),
            properties: row.get::<JsonValue, _>("properties"),
            metadata: row.get::<JsonValue, _>("metadata"),
            version: row.get::<i64, _>("version") as i32,
            created_at: row.get("created_at"),
            updated_at: row.get("updated_at"),
        })
        .collect();

    Ok(elements)
}

pub async fn get_element(pool: &SqlitePool, project_id: &str, element_id: &str) -> Result<Element> {
    let row = sqlx::query(
        r#"
        SELECT id, project_id, element_type, geometry, properties, metadata, version, created_at, updated_at
        FROM elements
        WHERE project_id = ? AND id = ?
        "#
    )
    .bind(project_id)
    .bind(element_id)
    .fetch_optional(pool)
    .await
    .map_err(AppError::Database)?
    .ok_or_else(|| AppError::NotFound(format!("Element not found: {}", element_id)))?;

    Ok(Element {
        id: row.get("id"),
        project_id: row.get("project_id"),
        element_type: row.get("element_type"),
        geometry: row.get::<JsonValue, _>("geometry"),
        properties: row.get::<JsonValue, _>("properties"),
        metadata: row.get::<JsonValue, _>("metadata"),
        version: row.get::<i64, _>("version") as i32,
        created_at: row.get("created_at"),
        updated_at: row.get("updated_at"),
    })
}

pub async fn create_element(pool: &SqlitePool, project_id: &str, data: CreateElement) -> Result<Element> {
    let element = Element::new(
        project_id.to_string(),
        data.element_type,
        data.geometry,
        data.properties,
        data.metadata,
    );

    sqlx::query(
        r#"
        INSERT INTO elements (
            id, project_id, element_type, geometry, properties, metadata,
            version, created_at, updated_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        "#
    )
    .bind(&element.id)
    .bind(&element.project_id)
    .bind(&element.element_type)
    .bind(&element.geometry)
    .bind(&element.properties)
    .bind(&element.metadata)
    .bind(element.version as i64)
    .bind(element.created_at)
    .bind(element.updated_at)
    .execute(pool)
    .await
    .map_err(AppError::Database)?;

    Ok(element)
}

pub async fn update_element(
    pool: &SqlitePool,
    project_id: &str,
    element_id: &str,
    data: UpdateElement,
) -> Result<Element> {
    let mut element = get_element(pool, project_id, element_id).await?;

    if let Some(element_type) = data.element_type {
        element.element_type = element_type;
    }
    if let Some(geometry) = data.geometry {
        element.geometry = serde_json::to_value(geometry)
            .map_err(|e| AppError::InvalidRequest(format!("Invalid geometry format: {}", e)))?;
    }
    if let Some(properties) = data.properties {
        element.properties = serde_json::to_value(properties)
            .map_err(|e| AppError::InvalidRequest(format!("Invalid properties format: {}", e)))?;
    }
    if let Some(metadata) = data.metadata {
        element.metadata = serde_json::to_value(metadata)
            .map_err(|e| AppError::InvalidRequest(format!("Invalid metadata format: {}", e)))?;
    }

    sqlx::query(
        r#"
        UPDATE elements
        SET element_type = ?, geometry = ?, properties = ?, metadata = ?,
            version = version + 1, updated_at = CURRENT_TIMESTAMP
        WHERE project_id = ? AND id = ?
        "#
    )
    .bind(&element.element_type)
    .bind(&element.geometry)
    .bind(&element.properties)
    .bind(&element.metadata)
    .bind(project_id)
    .bind(element_id)
    .execute(pool)
    .await
    .map_err(AppError::Database)?;

    get_element(pool, project_id, element_id).await
}

pub async fn delete_element(pool: &SqlitePool, project_id: &str, element_id: &str) -> Result<()> {
    let result = sqlx::query(
        r#"
        DELETE FROM elements
        WHERE project_id = ? AND id = ?
        "#
    )
    .bind(project_id)
    .bind(element_id)
    .execute(pool)
    .await
    .map_err(AppError::Database)?;

    if result.rows_affected() == 0 {
        return Err(AppError::NotFound(format!("Element not found: {}", element_id)));
    }

    Ok(())
} 