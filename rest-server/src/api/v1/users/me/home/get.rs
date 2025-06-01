use axum::{Extension, Json};
use sqlx::types::Decimal;

use crate::app::auth::AuthSession;
use crate::app::server::AppState;
use crate::json::error::ApiError;
use crate::json::home::{Home, SellerHomeStats, SellerTopProduct, SellerRecentOrder};
use crate::json::utils::{HomePage};

pub async fn home(
    Extension(state): Extension<AppState>,
    auth_session: AuthSession
) -> Result<Json<Home>, ApiError> {
    let user = auth_session.user.as_ref().unwrap();
    let query = HomePage {
        page: 1,
        per_page: 6
    };

    if user.roles.contains(&3) {
        let recent = super::most_recent::get::fetch(
            user.id,
            query.clone(),
            &state.pool,
        )
            .await?;

        let more_orders = super::more_orders::get::fetch(
            query.clone(),
            &state.pool,
        )
            .await?;

        let recommendations = crate::api::v1::users::get::recommendations(
            &state.pool
        )
            .await?;

        return Ok(Json(Home {
            role: user.roles.first().unwrap().clone(),
            recents: Some(recent),
            more_orders: Some(more_orders),
            recommendations: Some(recommendations),
        }));
    } else {}

    Ok(Json(Home {
        role: user.roles.first().unwrap().clone(),
        recents: None,
        more_orders: None,
        recommendations: None,
    }))
}

pub async fn seller_stats(
    Extension(state): Extension<AppState>,
    auth_session: AuthSession
) -> Result<Json<SellerHomeStats>, ApiError> {
    let user = auth_session.user.as_ref().unwrap();
    
    if !user.roles.contains(&4) {
        return Err(ApiError::Unauthorized("Usuário não é um vendedor".to_string()));
    }

    let monthly_revenue = sqlx::query_scalar::<_, Option<Decimal>>(
        r#"
        SELECT COALESCE(SUM(p.price * c.amount), 0) as revenue
        FROM cart c
        JOIN seller_products p ON c.seller_product_id = p.id
        WHERE p.seller_id = $1
        AND c.status IN (2, 4)
        "#
    )
    .bind(user.id)
    .fetch_one(&state.pool)
    .await?
    .unwrap_or(Decimal::new(0, 2));
    
    let total_orders = sqlx::query_scalar::<_, i64>(
        r#"
        SELECT COUNT(*) 
        FROM cart c
        JOIN seller_products p ON c.seller_product_id = p.id
        WHERE p.seller_id = $1
        "#
    )
    .bind(user.id)
    .fetch_one(&state.pool)
    .await?;

    let pending_orders = sqlx::query_scalar::<_, i64>(
        r#"
        SELECT COUNT(*) 
        FROM cart c
        JOIN seller_products p ON c.seller_product_id = p.id
        WHERE p.seller_id = $1
        AND c.status = 1
        "#
    )
    .bind(user.id)
    .fetch_one(&state.pool)
    .await?;
    
    let top_products = sqlx::query_as::<_, SellerTopProduct>(
        r#"
        SELECT 
            p.id,
            pr.name,
            p.photos[1] as photo,
            CAST(SUM(c.amount) AS BIGINT) as sold_quantity,
            SUM(p.price * c.amount) as revenue
        FROM cart c
        JOIN seller_products p ON c.seller_product_id = p.id
        JOIN products pr ON p.product_id = pr.id
        WHERE p.seller_id = $1
        GROUP BY p.id, pr.name, p.photos[1]
        ORDER BY sold_quantity DESC
        LIMIT 5
        "#
    )
    .bind(user.id)
    .fetch_all(&state.pool)
    .await?
    .into_iter()
    .collect();
    
    let recent_orders = sqlx::query_as::<_, SellerRecentOrder>(
        r#"
        SELECT 
            c.id,
            u.id as customer_id,
            u.name as customer_name,
            u.avatar as customer_avatar,
            pr.name as product_name,
            CAST(c.amount AS BIGINT),
            c.created_at,
            c.status
        FROM cart c
        JOIN seller_products p ON c.seller_product_id = p.id
        JOIN products pr ON p.product_id = pr.id
        JOIN users u ON c.customer_id = u.id
        WHERE p.seller_id = $1
        ORDER BY c.created_at DESC
        LIMIT 5
        "#
    )
    .bind(user.id)
    .fetch_all(&state.pool)
    .await?
    .into_iter()
    .collect();
    
    Ok(Json(SellerHomeStats {
        monthly_revenue,
        total_orders,
        pending_orders,
        top_products,
        recent_orders
    }))
}