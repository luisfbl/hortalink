use axum::{Extension, Json};
use axum::extract::{Path, Query};
use axum_garde::WithValidation;
use sqlx::{Pool, Postgres};
use crate::app::auth::AuthSession;
use crate::app::server::AppState;
use crate::json::error::ApiError;
use crate::json::utils::Pagination;
use crate::models::cart::OrderPreview;

pub async fn orders(
    Extension(state): Extension<AppState>,
    Path(customer_id): Path<i32>,
    WithValidation(query): WithValidation<Query<Pagination>>,
    auth_session: AuthSession,
) -> Result<Json<Vec<OrderPreview>>, ApiError> {
    if customer_id != auth_session.user.unwrap().id {
        return Err(ApiError::Unauthorized("Você não pode fazer isso!".to_string()))
    }
    
    let orders = fetch_orders(customer_id, query.into_inner(), &state.pool)
        .await?;

    Ok(Json(orders))
}

pub async fn fetch_orders(customer_id: i32, query: Pagination, pool: &Pool<Postgres>) -> Result<Vec<OrderPreview>, ApiError> {
    Ok(sqlx::query_as::<_, OrderPreview>(
        r#"
            SELECT c.id AS order_id, c.amount,
                sp.id AS product_id, p.name AS product_name,
                sp.photos[1] AS photo, c.status, sp.price, c.withdrawn,
                ss.start_time, c.created_at
            FROM cart c
            JOIN seller_products sp ON sp.id = c.seller_product_id
            JOIN schedules ss ON c.withdrawn = ss.id
            JOIN products p ON p.id = sp.product_id
            WHERE c.customer_id = $1 AND c.status <> 1
            ORDER BY c.created_at DESC
            LIMIT $2 OFFSET $3
        "#
    )
        .bind(customer_id)
        .bind(query.per_page)
        .bind((query.page - 1) * query.per_page)
        .fetch_all(pool)
        .await?
    )
}