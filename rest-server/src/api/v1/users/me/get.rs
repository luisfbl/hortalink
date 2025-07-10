use axum::{Extension, Json};
use axum::extract::Query;
use crate::api::v1::customers::orders::get::fetch_orders;
use crate::api::v1::sellers::ratings::get::fetch_reviews;
use crate::app::auth::AuthSession;
use crate::app::server::AppState;
use crate::json::error::ApiError;
use crate::json::users::{UserResponse, UserSettingsResponse};
use crate::json::utils::Pagination;
use crate::models::sellers::{PublicProfile, UserSettingsProfile};

#[derive(serde::Deserialize)]
pub struct UserMeInfo {
    pub extended: Option<bool>,
    pub settings: Option<bool>
}

pub async fn me(
    Extension(state): Extension<AppState>,
    Query(info): Query<UserMeInfo>,
    auth_session: AuthSession,
) -> Result<Json<UserResponse>, ApiError> {
    let login_user = auth_session.user.unwrap();

    // If settings=true, return settings profile with email
    if info.settings.unwrap_or(false) {
        let settings_profile = UserSettingsProfile::fetch(login_user.id, &state.pool).await?;
        return Ok(Json(UserResponse {
            profile: PublicProfile {
                name: settings_profile.name,
                id: settings_profile.id,
                bio: settings_profile.bio,
                avatar: settings_profile.avatar,
                is_seller: settings_profile.is_seller,
                followers: settings_profile.followers,
                roles: settings_profile.roles,
                following: settings_profile.following,
                orders_made: settings_profile.orders_made,
                orders_received: settings_profile.orders_received,
                email: Some(settings_profile.email),
                email_notifications: Some(settings_profile.email_notifications),
            },
            orders: None,
            reviews: None,
            customer_reviews: None,
            products: None,
        }));
    }

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