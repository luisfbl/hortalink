use crate::app::auth::AuthSession;
use crate::json::error::ApiError;
use crate::json::auth::DeleteAccountRequest;
use axum::{Json, Extension};
use password_auth::verify_password;
use axum_login::AuthUser;
use crate::app::server::AppState;

pub async fn delete_account(
    mut auth_session: AuthSession,
    Extension(state): Extension<AppState>,
    Json(request): Json<DeleteAccountRequest>
) -> Result<(), ApiError> {
    let pool = state.pool;
    let user = match &auth_session.user {
        Some(user) => user.clone(),
        None => return Err(ApiError::Unauthorized("User not authenticated".into()))
    };

    if let Some(password_hash) = &user.password {
        let password = request.password
            .ok_or(ApiError::Custom(axum::http::StatusCode::BAD_REQUEST, "Senha é obrigatória para contas com senha".into()))?;
            
        verify_password(&password, password_hash)
            .map_err(|_| ApiError::Custom(axum::http::StatusCode::BAD_REQUEST, "Senha incorreta".into()))?;
    } else {
        if !request.oauth_confirmation.unwrap_or(false) {
            return Err(ApiError::Custom(axum::http::StatusCode::BAD_REQUEST, "Confirmação necessária para excluir conta OAuth".into()));
        }
    }

    let mut tx = pool.begin().await
        .map_err(|e| ApiError::Custom(axum::http::StatusCode::INTERNAL_SERVER_ERROR, format!("Database error: {}", e)))?;
    
    sqlx::query("DELETE FROM messages WHERE author_id = $1")
        .bind(user.id())
        .execute(&mut *tx).await
        .map_err(|e| ApiError::Custom(axum::http::StatusCode::INTERNAL_SERVER_ERROR, format!("Failed to delete messages: {}", e)))?;
    
    sqlx::query("DELETE FROM chats WHERE user1 = $1 OR user2 = $1")
        .bind(user.id())
        .execute(&mut *tx).await
        .map_err(|e| ApiError::Custom(axum::http::StatusCode::INTERNAL_SERVER_ERROR, format!("Failed to delete chats: {}", e)))?;
    
    sqlx::query("DELETE FROM notifications WHERE user_id = $1")
        .bind(user.id())
        .execute(&mut *tx).await
        .map_err(|e| ApiError::Custom(axum::http::StatusCode::INTERNAL_SERVER_ERROR, format!("Failed to delete notifications: {}", e)))?;
    
    sqlx::query("DELETE FROM followers WHERE seller_id = $1 OR customer_id = $1")
        .bind(user.id())
        .execute(&mut *tx).await
        .map_err(|e| ApiError::Custom(axum::http::StatusCode::INTERNAL_SERVER_ERROR, format!("Failed to delete followers: {}", e)))?;
    
    sqlx::query("DELETE FROM cart WHERE customer_id = $1")
        .bind(user.id())
        .execute(&mut *tx).await
        .map_err(|e| ApiError::Custom(axum::http::StatusCode::INTERNAL_SERVER_ERROR, format!("Failed to delete cart: {}", e)))?;
    
    sqlx::query("DELETE FROM products_seen_recently WHERE customer = $1")
        .bind(user.id())
        .execute(&mut *tx).await
        .map_err(|e| ApiError::Custom(axum::http::StatusCode::INTERNAL_SERVER_ERROR, format!("Failed to delete products seen recently: {}", e)))?;
    
    sqlx::query("DELETE FROM seller_product_ratings WHERE author_id = $1")
        .bind(user.id())
        .execute(&mut *tx).await
        .map_err(|e| ApiError::Custom(axum::http::StatusCode::INTERNAL_SERVER_ERROR, format!("Failed to delete ratings: {}", e)))?;
    
    sqlx::query("DELETE FROM products_schedules WHERE seller_product_id IN (SELECT id FROM seller_products WHERE seller_id = $1)")
        .bind(user.id())
        .execute(&mut *tx).await
        .map_err(|e| ApiError::Custom(axum::http::StatusCode::INTERNAL_SERVER_ERROR, format!("Failed to delete product schedules: {}", e)))?;
    
    sqlx::query("DELETE FROM seller_products WHERE seller_id = $1")
        .bind(user.id())
        .execute(&mut *tx).await
        .map_err(|e| ApiError::Custom(axum::http::StatusCode::INTERNAL_SERVER_ERROR, format!("Failed to delete seller products: {}", e)))?;
    
    sqlx::query("DELETE FROM sellers WHERE user_id = $1")
        .bind(user.id())
        .execute(&mut *tx).await
        .map_err(|e| ApiError::Custom(axum::http::StatusCode::INTERNAL_SERVER_ERROR, format!("Failed to delete seller profile: {}", e)))?;
    
    sqlx::query("DELETE FROM customers WHERE user_id = $1")
        .bind(user.id())
        .execute(&mut *tx).await
        .map_err(|e| ApiError::Custom(axum::http::StatusCode::INTERNAL_SERVER_ERROR, format!("Failed to delete customer profile: {}", e)))?;

    sqlx::query("DELETE FROM users WHERE id = $1")
        .bind(user.id())
        .execute(&mut *tx)
        .await
        .map_err(|e| ApiError::Custom(axum::http::StatusCode::INTERNAL_SERVER_ERROR, format!("Failed to delete user: {}", e)))?;

    tx.commit().await
        .map_err(|e| ApiError::Custom(axum::http::StatusCode::INTERNAL_SERVER_ERROR, format!("Failed to commit transaction: {}", e)))?;

    auth_session.logout().await.map_err(|e| ApiError::Custom(axum::http::StatusCode::INTERNAL_SERVER_ERROR, format!("Failed to logout: {}", e)))?;
    
    Ok(())
}