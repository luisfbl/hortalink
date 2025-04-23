use axum::{Extension, Json};

use crate::app::auth::AuthSession;
use crate::app::server::AppState;
use crate::json::error::ApiError;
use crate::models::cart::Order;

pub async fn products(
    Extension(state): Extension<AppState>,
    auth_session: AuthSession,
) -> Result<Json<Vec<Order>>, ApiError> {
    let cart_products = sqlx::query_as::<_, Order>(
        r#"
            SELECT u.name, u.avatar, sp.seller_id AS user_id,
                jsonb_agg(json_build_object(
                    'order_id', c.id,
                    'start_time', ss.start_time,
                    'day_of_week', ss.day_of_week,
                    'withdrawn', c.withdrawn,
                    'amount', c.amount,
                    'price', sp.price,
                    'product_id', sp.id,
                    'photo', sp.photos[1],
                    'product_name', p.name,
                    'unit', sp.unit
                )) AS products
            FROM cart c
            JOIN seller_products sp ON sp.id = c.seller_product_id
            JOIN products p ON sp.product_id = p.id
            JOIN users u ON u.id = sp.seller_id
            JOIN schedules ss ON c.withdrawn = ss.id 
            WHERE c.customer_id = $1 AND c.status = 1
            GROUP BY u.name, u.avatar, sp.seller_id, c.created_at
            ORDER BY c.created_at DESC
        "#
    )
        .bind(auth_session.user.unwrap().id)
        .fetch_all(&state.pool)
        .await?;

    Ok(Json(cart_products))
}