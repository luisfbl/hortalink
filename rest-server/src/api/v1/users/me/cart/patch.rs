use axum::{Extension, Json};
use axum::extract::Path;
use axum_garde::WithValidation;

use crate::app::auth::AuthSession;
use crate::app::server::AppState;
use crate::json::cart::PatchProductCart;
use crate::json::error::ApiError;
use crate::models::cart::Order;

pub async fn product(
    Extension(state): Extension<AppState>,
    Path(order_id): Path<i32>,
    auth_session: AuthSession,
    WithValidation(payload): WithValidation<Json<PatchProductCart>>,
) -> Result<(), ApiError> {
    let customer_id = Order::get_customer(&state.pool, order_id)
        .await?;

    if customer_id != auth_session.user.unwrap().id {
        return Err(ApiError::Unauthorized("Você não pode fazer isso".to_string()));
    }

    sqlx::query(
        r#"
            UPDATE cart
            SET
                withdrawn = COALESCE($1, withdrawn),
                amount = COALESCE($2, amount)
            WHERE id = $3
        "#
    )
        .bind(payload.withdrawn)
        .bind(payload.amount)
        .bind(order_id)
        .execute(&state.pool)
        .await?;

    Ok(())
}