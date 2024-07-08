use axum::{Extension, Json};
use axum::extract::Query;
use axum_garde::WithValidation;

use crate::app::auth::AuthSession;
use crate::app::server::AppState;
use crate::json::error::ApiError;
use crate::json::home::Home;
use crate::json::utils::{HomePage, Location};
use crate::models::users::PreviewUser;

pub async fn home(
    Extension(state): Extension<AppState>,
    auth_session: AuthSession,
    WithValidation(query): WithValidation<Query<Location>>,
) -> Result<Json<Home>, ApiError> {
    let user = auth_session.user.as_ref().unwrap();
    let query = HomePage {
        longitude: query.longitude,
        latitude: query.latitude,
        page: 1,
        per_page: 9
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

        let recommendations = sqlx::query_as::<_, PreviewUser>(
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
            .fetch_all(&state.pool)
            .await?;

        return Ok(Json(Home {
            recents: Some(recent),
            more_orders: Some(more_orders),
            recommendations: Some(recommendations),
        }));
    } else {}

    return Ok(Json(Home {
        recents: None,
        more_orders: None,
        recommendations: None,
    }));
}