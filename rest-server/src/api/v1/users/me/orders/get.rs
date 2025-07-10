use axum::{Extension, Json};
use axum::extract::Path;
use crate::app::auth::AuthSession;
use crate::app::server::AppState;
use crate::json::error::ApiError;
use crate::models::cart::Order;

pub async fn orders(
    Extension(state): Extension<AppState>,
    auth_session: AuthSession,
) -> Result<Json<Vec<Order>>, ApiError> {
    let orders = sqlx::query_as::<_, Order>(
        r#"
            WITH withdrawn_data AS (
                SELECT c.id AS cart_id, 
                       json_agg(json_build_object(
                           'id', s.id,
                           'start_time', s.start_time,
                           'end_time', s.end_time,
                           'day_of_week', s.day_of_week,
                           'address', pl.address,
                           'longitude', ST_X(pl.geolocation),
                           'latitude', ST_Y(pl.geolocation)
                       )) AS withdrawn
                FROM cart c
                LEFT JOIN schedules s ON s.id = c.withdrawn
                LEFT JOIN places pl ON s.place = pl.id
                GROUP BY c.id
            )
            SELECT u.name, u.avatar, c.customer_id AS user_id,
                jsonb_agg(json_build_object(
                    'order_id', c.id,
                    'withdrawn', wd.withdrawn,
                    'amount', c.amount,
                    'price', sp.price,
                    'product_id', sp.id,
                    'photo', sp.photos[1],
                    'product_name', p.name,
                    'unit', sp.unit,
                    'status', c.status,
                    'created_at', c.created_at,
                    'picked_up', c.picked_up,
                    'pickup_date', c.pickup_date
                )) AS products
            FROM cart c
            JOIN seller_products sp ON c.seller_product_id = sp.id
            JOIN products p ON sp.product_id = p.id
            JOIN users u ON (c.customer_id = $1 AND sp.seller_id = u.id) 
                OR (sp.seller_id = $1 AND c.customer_id = u.id)
            LEFT JOIN withdrawn_data wd ON wd.cart_id = c.id
            WHERE sp.seller_id = $1 AND (c.status = 2 OR c.status = 3 OR c.status = 4)
            GROUP BY u.name, u.avatar, c.customer_id, c.created_at
            ORDER BY c.created_at DESC;
        "#
    )
        .bind(auth_session.user.unwrap().id)
        .fetch_all(&state.pool)
        .await?;

    Ok(Json(orders))
}

pub async fn order(
    Extension(state): Extension<AppState>,
    auth_session: AuthSession,
    Path(order_id): Path<i32>,
) -> Result<Json<Option<Order>>, ApiError> {
    let order = sqlx::query_as::<_, Order>(
        r#"
            WITH withdrawn_data AS (
                SELECT c.id AS cart_id, 
                       json_agg(json_build_object(
                           'id', s.id,
                           'start_time', s.start_time,
                           'end_time', s.end_time,
                           'day_of_week', s.day_of_week,
                           'address', pl.address,
                           'longitude', ST_X(pl.geolocation),
                           'latitude', ST_Y(pl.geolocation)
                       )) AS withdrawn
                FROM cart c
                LEFT JOIN schedules s ON s.id = c.withdrawn
                LEFT JOIN places pl ON s.place = pl.id
                GROUP BY c.id
            )
            SELECT u.name, u.avatar, u.id AS user_id,
                   json_agg(json_build_object(
                       'order_id', c.id,
                       'withdrawn', wd.withdrawn,
                       'amount', c.amount,
                       'price', sp.price,
                       'product_id', sp.id,
                       'photo', sp.photos[1],
                       'product_name', p.name,
                       'unit', sp.unit,
                       'status', c.status,
                       'created_at', c.created_at,
                       'picked_up', c.picked_up,
                       'pickup_date', c.pickup_date
                   )) AS products
            FROM cart c
            JOIN seller_products sp ON c.seller_product_id = sp.id
            JOIN products p ON sp.product_id = p.id
            JOIN users u ON (c.customer_id = $2 AND sp.seller_id = u.id) 
                OR (sp.seller_id = $2 AND c.customer_id = u.id)
            LEFT JOIN withdrawn_data wd ON wd.cart_id = c.id
            WHERE c.id = $1
            GROUP BY u.name, u.avatar, u.id, c.created_at
            ORDER BY c.created_at DESC;
        "#
    )
        .bind(order_id)
        .bind(auth_session.user.unwrap().id)
        .fetch_optional(&state.pool)
        .await?;

    Ok(Json(order))
}