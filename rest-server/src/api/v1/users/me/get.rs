use axum::{Extension, Json};
use axum::extract::Query;
use crate::api::v1::customers::orders::get::fetch_orders;
use crate::api::v1::sellers::ratings::get::fetch_reviews;
use crate::app::auth::AuthSession;
use crate::app::server::AppState;
use crate::json::error::ApiError;
use crate::json::users::UserResponse;
use crate::json::utils::Pagination;
use crate::models::sellers::PublicProfile;

#[derive(serde::Deserialize)]
pub struct UserMeInfo {
    pub extended: Option<bool>
}

pub async fn me(
    Extension(state): Extension<AppState>,
    Query(info): Query<UserMeInfo>,
    auth_session: AuthSession,
) -> Result<Json<UserResponse>, ApiError> {
    let login_user = auth_session.user.unwrap();

    let profile = PublicProfile::fetch(login_user.id, &state.pool)
        .await?;

    if !info.extended.unwrap_or(false) {
        return Ok(Json(UserResponse {
            profile,
            orders: None,
            reviews: None,
            customer_reviews: None,
            products: None,
        }));
    }

    if profile.is_seller {
        Ok(
            Json(UserResponse {
                profile,
                orders: None,
                reviews: Some(fetch_reviews(
                    login_user.id, 
                    Pagination { page: 1, per_page: 15 }, 
                    &state.pool
                ).await?),
                customer_reviews: None,
                products: None,
            })
        )
    } else {
        Ok(
            Json(UserResponse {
                profile,
                orders: Some(fetch_orders(
                    login_user.id, 
                    Pagination { page: 1, per_page: 15 }, 
                    &state.pool
                ).await?),
                reviews: None,
                customer_reviews: None,
                products: None,
            })
        )
    }
}