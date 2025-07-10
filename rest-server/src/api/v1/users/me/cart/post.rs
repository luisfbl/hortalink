use axum::{Extension, Json};
use axum::extract::Path;
use axum::http::StatusCode;
use axum_garde::WithValidation;

use crate::app::auth::AuthSession;
use crate::app::server::AppState;
use crate::json::cart::PostProductCart;
use crate::json::error::ApiError;
use crate::models::cart::Order;

pub async fn product(
    Extension(state): Extension<AppState>,
    auth_session: AuthSession,
    WithValidation(payload): WithValidation<Json<PostProductCart>>,
) -> Result<(), ApiError> {
    if let Some(withdrawn) = payload.withdrawn {
        sqlx::query_scalar::<_, i64>(
            r#"
            SELECT id
            FROM products_schedules
            WHERE seller_product_id = $1 AND schedule_id = $2
            "#
        )
            .bind(payload.seller_product_id)
            .bind(withdrawn)
            .fetch_optional(&state.pool)
            .await?
            .ok_or(ApiError::Custom(StatusCode::BAD_REQUEST, "Agenda inválida".to_string()))?;
    }

    sqlx::query(
        r#"
            INSERT INTO cart (seller_product_id, customer_id, withdrawn, amount)
            VALUES ($1, $2, $3, $4)
        "#
    )
        .bind(payload.seller_product_id)
        .bind(auth_session.user.unwrap().id)
        .bind(payload.withdrawn)
        .bind(payload.amount)
        .bind(payload.picked_up.unwrap_or(false))
        .bind(payload.pickup_date)
        .execute(&state.pool)
        .await?;

    Ok(())
}

pub async fn reserve_product(
    Extension(state): Extension<AppState>,
    Path(order_id): Path<i32>,
    auth_session: AuthSession,
) -> Result<(), ApiError> {
    let customer_id = Order::get_customer(&state.pool, order_id)
        .await?;

    if customer_id != auth_session.user.unwrap().id {
        return Err(ApiError::Unauthorized("Você não pode fazer isso".to_string()));
    }

    sqlx::query(
        r#"
            UPDATE cart
            SET status = 2
            WHERE id = $1
        "#
    )
        .bind(order_id)
        .execute(&state.pool)
        .await?;

    Ok(())
}