use sqlx::{Row, SqlitePool};

use crate::{
    error::{AppError, Result},
    models::project::{CreateProject, Project, UpdateProject},
};

pub async fn list_projects(pool: &SqlitePool) -> Result<Vec<Project>> {
    let rows = sqlx::query(
        r#"
        SELECT id, name, description, created_at, updated_at, version
        FROM projects
        ORDER BY updated_at DESC
        "#
    )
    .fetch_all(pool)
    .await
    .map_err(AppError::Database)?;

    let projects = rows
        .iter()
        .map(|row| Project {
            id: row.get("id"),
            name: row.get("name"),
            description: row.get("description"),
            created_at: row.get("created_at"),
            updated_at: row.get("updated_at"),
            version: row.get::<i64, _>("version") as i32,
        })
        .collect();

    Ok(projects)
}

pub async fn get_project(pool: &SqlitePool, id: &str) -> Result<Project> {
    let row = sqlx::query(
        r#"
        SELECT id, name, description, created_at, updated_at, version
        FROM projects
        WHERE id = ?
        "#
    )
    .bind(id)
    .fetch_optional(pool)
    .await
    .map_err(AppError::Database)?
    .ok_or_else(|| AppError::NotFound(format!("Project not found: {}", id)))?;

    Ok(Project {
        id: row.get("id"),
        name: row.get("name"),
        description: row.get("description"),
        created_at: row.get("created_at"),
        updated_at: row.get("updated_at"),
        version: row.get::<i64, _>("version") as i32,
    })
}

pub async fn create_project(pool: &SqlitePool, data: CreateProject) -> Result<Project> {
    let project = Project::new(data.name, data.description);

    sqlx::query(
        r#"
        INSERT INTO projects (id, name, description, created_at, updated_at, version)
        VALUES (?, ?, ?, ?, ?, ?)
        "#
    )
    .bind(&project.id)
    .bind(&project.name)
    .bind(&project.description)
    .bind(project.created_at)
    .bind(project.updated_at)
    .bind(project.version as i64)
    .execute(pool)
    .await
    .map_err(AppError::Database)?;

    Ok(project)
}

pub async fn update_project(pool: &SqlitePool, id: &str, data: UpdateProject) -> Result<Project> {
    let mut project = get_project(pool, id).await?;

    if let Some(name) = data.name {
        project.name = name;
    }
    if let Some(description) = data.description {
        project.description = Some(description);
    }

    sqlx::query(
        r#"
        UPDATE projects
        SET name = ?, description = ?, updated_at = CURRENT_TIMESTAMP, version = version + 1
        WHERE id = ?
        "#
    )
    .bind(&project.name)
    .bind(&project.description)
    .bind(id)
    .execute(pool)
    .await
    .map_err(AppError::Database)?;

    get_project(pool, id).await
}

pub async fn delete_project(pool: &SqlitePool, id: &str) -> Result<()> {
    let result = sqlx::query(
        r#"
        DELETE FROM projects
        WHERE id = ?
        "#
    )
    .bind(id)
    .execute(pool)
    .await
    .map_err(AppError::Database)?;

    if result.rows_affected() == 0 {
        return Err(AppError::NotFound(format!("Project not found: {}", id)));
    }

    Ok(())
} 