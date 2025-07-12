use axum::{Extension, Json, extract::Path};

use crate::app::auth::AuthSession;
use crate::app::server::AppState;
use crate::json::error::ApiError;
use crate::models::chats::ChatPreview;

pub async fn get_chat(
    Extension(state): Extension<AppState>,
    auth_session: AuthSession,
    Path(chat_id): Path<i64>,
) -> Result<Json<ChatPreview>, ApiError> {
    let user = auth_session.user.unwrap();
    
    let chat = sqlx::query_as::<_, ChatPreview>(
        r#"
            SELECT 
                c.id,
                u.id AS user_id,
                u.avatar AS user_avatar,
                u.name AS user_name,
                (
                    SELECT content 
                    FROM messages 
                    WHERE chat = c.id 
                    ORDER BY created_at DESC 
                    LIMIT 1
                ) AS last_message
            FROM chats c
            INNER JOIN users u ON (u.id = c.user1 OR u.id = c.user2) AND u.id <> $1
            WHERE c.id = $2 AND (c.user1 = $1 OR c.user2 = $1)
        "#
    )
        .bind(user.id)
        .bind(chat_id)
        .fetch_optional(&state.pool)
        .await?;

    match chat {
        Some(chat) => Ok(Json(chat)),
        None => Err(ApiError::NotFound("Chat not found or access denied".to_string()))
    }
}