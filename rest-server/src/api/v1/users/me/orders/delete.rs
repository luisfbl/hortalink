use axum::Extension;
use axum::extract::Path;

use crate::app::auth::AuthSession;
use crate::app::server::AppState;
use crate::json::error::ApiError;
use crate::models::cart::Order;

pub async fn order(
    Extension(state): Extension<AppState>,
    Path(order_id): Path<i32>,
    auth_session: AuthSession,
) -> Result<(), ApiError> {
    let seller_id = Order::get_seller(&state.pool, order_id)
        .await?;
    let customer_id = Order::get_customer(&state.pool, order_id)
        .await?;
    let user = auth_session.user.unwrap();

    if (seller_id != user.id) && (customer_id != user.id) {
        return Err(ApiError::Unauthorized("Você não pode fazer isso".to_string()));
    }

    sqlx::query(
        r#"
            UPDATE cart
            SET status = 3
            WHERE id = $1
        "#
    )
        .bind(order_id)
        .execute(&state.pool)
        .await?;

    Ok(())
}