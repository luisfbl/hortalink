use axum::{Extension, Json};
use axum::extract::{Path, Query};
use axum_garde::WithValidation;
use sqlx::{Pool, Postgres};

use crate::api::v1::customers::ratings::get::fetch_reviews;
use crate::api::v1::sellers::products::get::fetch_products;
use crate::app::server::AppState;
use crate::json::error::ApiError;
use crate::json::users::{FilterUsers, UserResponse};
use crate::json::utils::{HomePage, Location, Pagination};
use crate::models::sellers::PublicProfile;
use crate::models::users::PreviewUser;

pub async fn user(
    Extension(state): Extension<AppState>,
    Path(user_id): Path<i32>,
) -> Result<Json<UserResponse>, ApiError> {
    let profile = PublicProfile::fetch(user_id, &state.pool)
        .await?;

    if profile.is_seller {
        Ok(Json(UserResponse {
            profile,
            orders: None,
            reviews: None,
            customer_reviews: None,
            products: Some(fetch_products(
                user_id,
                HomePage {
                    page: 1,
                    per_page: 15,
                },
                &state.pool,
            ).await?),
        }))
    } else {
        Ok(Json(UserResponse {
            profile,
            orders: None,
            reviews: None,
            customer_reviews: Some(fetch_reviews(
                user_id,
                Pagination { page: 1, per_page: 15 },
                &state.pool,
            ).await?),
            products: None,
        }))
    }
}

pub async fn users(
    Extension(state): Extension<AppState>,
    WithValidation(query): WithValidation<Query<FilterUsers>>,
) -> Result<Json<Vec<PreviewUser>>, ApiError> {
    let query = query.into_inner();

    if let Some(filter) = query.query {
        let users = sqlx::query_as::<_, PreviewUser>(
            &format!(
                r#"
            SELECT id AS user_id, avatar as user_avatar, name as user_name
            FROM users
            WHERE name LIKE '%{}%'
            LIMIT $1 OFFSET $2;
        "#, filter.to_lowercase()
            )
        )
            .bind(query.per_page)
            .bind((query.page - 1) * query.per_page)
            .fetch_all(&state.pool)
            .await?;

        Ok(Json(users))
    } else {
        let users = recommendations(&state.pool)
            .await?;

        Ok(Json(users))
    }
}

pub async fn recommendations(pool: &Pool<Postgres>) -> Result<Vec<PreviewUser>, ApiError> {
    Ok(sqlx::query_as::<_, PreviewUser>(
        r#"
                SELECT s.user_id, u.avatar as user_avatar, u.name as user_name
                FROM sellers s
                JOIN (
                    SELECT DISTINCT seller_id
                    FROM seller_products
                ) sp ON s.user_id = sp.seller_id
                JOIN users u ON u.id = s.user_id
                ORDER BY RANDOM()
                LIMIT 9;
            "#
    )
        .fetch_all(pool)
        .await?)
}