use axum::{Extension, Json};
use axum::extract::Path;
use axum_garde::WithValidation;
use serde::{Deserialize, Serialize};
use garde::Validate;

use crate::app::auth::AuthSession;
use crate::app::server::AppState;
use crate::json::error::ApiError;
use crate::models::cart::Order;

#[derive(Serialize, Deserialize, Validate)]
pub struct PatchOrderPickup {
    #[garde(skip)]
    pub picked_up: Option<bool>,
    #[garde(skip)]
    pub pickup_date: Option<String>,
}

pub async fn pickup_status(
    Extension(state): Extension<AppState>,
    Path(order_id): Path<i32>,
    auth_session: AuthSession,
    WithValidation(payload): WithValidation<Json<PatchOrderPickup>>,
) -> Result<(), ApiError> {
    let seller_id = Order::get_seller(&state.pool, order_id)
        .await?;

    if seller_id != auth_session.user.unwrap().id {
        return Err(ApiError::Unauthorized("Você não pode fazer isso".to_string()));
    }

    let pickup_date = if let Some(date_str) = &payload.pickup_date {
        Some(sqlx::types::chrono::NaiveDateTime::parse_from_str(&date_str, "%Y-%m-%d %H:%M:%S")
            .map_err(|_| ApiError::NotFound("Formato de data inválido".to_string()))?)
    } else {
        None
    };

    sqlx::query(
        r#"
            UPDATE cart
            SET
                picked_up = COALESCE($1, picked_up),
                pickup_date = COALESCE($2, pickup_date)
            WHERE id = $3
        "#
    )
        .bind(payload.picked_up)
        .bind(pickup_date)
        .bind(order_id)
        .execute(&state.pool)
        .await?;

    Ok(())
}