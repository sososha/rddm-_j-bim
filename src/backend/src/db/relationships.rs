use sqlx::{Row, SqlitePool};
use serde_json::Value as JsonValue;

use crate::{
    error::{AppError, Result},
    models::relationship::{CreateRelationship, Relationship, UpdateRelationship},
};

pub async fn list_relationships(pool: &SqlitePool, element_id: &str) -> Result<Vec<Relationship>> {
    let rows = sqlx::query(
        r#"
        SELECT id, source_id, target_id, relationship_type, properties, created_at
        FROM element_relationships
        WHERE source_id = ? OR target_id = ?
        ORDER BY created_at ASC
        "#
    )
    .bind(element_id)
    .bind(element_id)
    .fetch_all(pool)
    .await
    .map_err(AppError::Database)?;

    let relationships = rows
        .iter()
        .map(|row| Relationship {
            id: row.get("id"),
            source_id: row.get("source_id"),
            target_id: row.get("target_id"),
            relationship_type: row.get("relationship_type"),
            properties: row.get::<Option<JsonValue>, _>("properties"),
            created_at: row.get("created_at"),
        })
        .collect();

    Ok(relationships)
}

pub async fn get_relationship(pool: &SqlitePool, relationship_id: &str) -> Result<Relationship> {
    let row = sqlx::query(
        r#"
        SELECT id, source_id, target_id, relationship_type, properties, created_at
        FROM element_relationships
        WHERE id = ?
        "#
    )
    .bind(relationship_id)
    .fetch_optional(pool)
    .await
    .map_err(AppError::Database)?
    .ok_or_else(|| AppError::NotFound(format!("Relationship not found: {}", relationship_id)))?;

    Ok(Relationship {
        id: row.get("id"),
        source_id: row.get("source_id"),
        target_id: row.get("target_id"),
        relationship_type: row.get("relationship_type"),
        properties: row.get::<Option<JsonValue>, _>("properties"),
        created_at: row.get("created_at"),
    })
}

pub async fn create_relationship(pool: &SqlitePool, data: CreateRelationship) -> Result<Relationship> {
    let relationship = Relationship::new(
        data.source_id,
        data.target_id,
        data.relationship_type,
        data.properties,
    );

    sqlx::query(
        r#"
        INSERT INTO element_relationships (
            id, source_id, target_id, relationship_type, properties, created_at
        )
        VALUES (?, ?, ?, ?, ?, ?)
        "#
    )
    .bind(&relationship.id)
    .bind(&relationship.source_id)
    .bind(&relationship.target_id)
    .bind(&relationship.relationship_type)
    .bind(&relationship.properties)
    .bind(relationship.created_at)
    .execute(pool)
    .await
    .map_err(AppError::Database)?;

    Ok(relationship)
}

pub async fn update_relationship(
    pool: &SqlitePool,
    relationship_id: &str,
    data: UpdateRelationship,
) -> Result<Relationship> {
    let mut relationship = get_relationship(pool, relationship_id).await?;

    if let Some(relationship_type) = data.relationship_type {
        relationship.relationship_type = relationship_type;
    }
    if let Some(properties) = data.properties {
        relationship.properties = Some(serde_json::to_value(properties).map_err(|e| {
            AppError::InvalidRequest(format!("Invalid properties format: {}", e))
        })?);
    }

    sqlx::query(
        r#"
        UPDATE element_relationships
        SET relationship_type = ?, properties = ?
        WHERE id = ?
        "#
    )
    .bind(&relationship.relationship_type)
    .bind(&relationship.properties)
    .bind(relationship_id)
    .execute(pool)
    .await
    .map_err(AppError::Database)?;

    get_relationship(pool, relationship_id).await
}

pub async fn delete_relationship(pool: &SqlitePool, relationship_id: &str) -> Result<()> {
    let result = sqlx::query(
        r#"
        DELETE FROM element_relationships
        WHERE id = ?
        "#
    )
    .bind(relationship_id)
    .execute(pool)
    .await
    .map_err(AppError::Database)?;

    if result.rows_affected() == 0 {
        return Err(AppError::NotFound(format!("Relationship not found: {}", relationship_id)));
    }

    Ok(())
} 