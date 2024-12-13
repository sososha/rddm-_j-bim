use axum::{
    http::StatusCode,
    response::{IntoResponse, Response},
    Json,
};
use serde_json::json;
use thiserror::Error;

#[derive(Error, Debug)]
pub enum AppError {
    #[error("Database error: {0}")]
    Database(#[from] sqlx::Error),

    #[error("JSON error: {0}")]
    Json(#[from] serde_json::Error),

    #[error("Not found: {0}")]
    NotFound(String),

    #[error("Invalid request: {0}")]
    InvalidRequest(String),

    #[error("Conflict: {0}")]
    Conflict(String),

    #[error("Unauthorized: {0}")]
    Unauthorized(String),

    #[error("Forbidden: {0}")]
    Forbidden(String),

    #[error("Internal server error: {0}")]
    Internal(String),
}

impl IntoResponse for AppError {
    fn into_response(self) -> Response {
        let (status, error_message) = match self {
            AppError::Database(ref e) => (
                StatusCode::INTERNAL_SERVER_ERROR,
                format!("A database error occurred: {}", e),
            ),
            AppError::Json(ref e) => (
                StatusCode::BAD_REQUEST,
                format!("A JSON error occurred: {}", e),
            ),
            AppError::NotFound(ref message) => (StatusCode::NOT_FOUND, message.clone()),
            AppError::InvalidRequest(ref message) => (StatusCode::BAD_REQUEST, message.clone()),
            AppError::Conflict(ref message) => (StatusCode::CONFLICT, message.clone()),
            AppError::Unauthorized(ref message) => (StatusCode::UNAUTHORIZED, message.clone()),
            AppError::Forbidden(ref message) => (StatusCode::FORBIDDEN, message.clone()),
            AppError::Internal(ref message) => (
                StatusCode::INTERNAL_SERVER_ERROR,
                format!("An internal error occurred: {}", message),
            ),
        };

        let body = Json(json!({
            "error": {
                "code": status.as_u16(),
                "message": error_message,
            }
        }));

        (status, body).into_response()
    }
}

pub type Result<T> = std::result::Result<T, AppError>; 