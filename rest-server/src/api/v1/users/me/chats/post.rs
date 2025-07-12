use axum::{Extension, Json};
use axum::extract::Query;
use axum_garde::WithValidation;
use serde::Serialize;

use crate::app::auth::AuthSession;
use crate::app::server::AppState;
use crate::json::chats::CreateChat;
use crate::json::error::ApiError;

#[derive(Serialize)]
pub struct ChatCreatedResponse {
    chat_id: i64,
}

pub async fn chat(
    Extension(state): Extension<AppState>,
    auth_session: AuthSession,
    WithValidation(payload): WithValidation<Query<CreateChat>>,
) -> Result<Json<ChatCreatedResponse>, ApiError> {
    let user = auth_session.user.unwrap();
    
    if user.id == payload.user_id {
        println!("Erro: Tentativa de criar chat consigo mesmo");
        return Err(ApiError::Custom(axum::http::StatusCode::BAD_REQUEST, "Cannot create chat with yourself".to_string()));
    }

    let existing_chat = sqlx::query_scalar::<_, i64>(
        r#"
            SELECT id FROM chats 
            WHERE (user1 = $1 AND user2 = $2) 
               OR (user1 = $2 AND user2 = $1)
            LIMIT 1
        "#
    )
        .bind(user.id)
        .bind(payload.user_id)
        .fetch_optional(&state.pool)
        .await?;

    let chat_id = if let Some(existing_id) = existing_chat {
        existing_id
    } else {
        let new_chat_id = sqlx::query_scalar::<_, i64>(
            r#"
                INSERT INTO chats (user1, user2)
                VALUES ($1, $2)
                RETURNING id
            "#
        )
            .bind(user.id)
            .bind(payload.user_id)
            .fetch_one(&state.pool)
            .await?;

        new_chat_id
    };

    Ok(Json(ChatCreatedResponse { chat_id }))
}