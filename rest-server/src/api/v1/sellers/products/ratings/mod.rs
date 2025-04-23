use axum::Router;
use axum::routing::{delete, get, post};
use axum_login::permission_required;

use common::entities::UserRole;

use crate::app::auth::AuthGate;

mod get;
mod post;
mod patch;
mod delete;

pub fn router() -> Router {
    Router::new()
        .route("/:rating_id", delete(delete::rating)
            .patch(patch::rating),
        )
        .route("/", post(post::rating))
        .route_layer(permission_required!(AuthGate, /*UserRole::Verified,*/ UserRole::Customer))
        .route("/", get(get::ratings))
}