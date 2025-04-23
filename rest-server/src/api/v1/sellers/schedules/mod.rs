use axum::Router;
use axum::routing::{get, patch, post};
use axum_login::permission_required;

use common::entities::UserRole;

use crate::app::auth::AuthGate;

mod get;
mod post;
mod patch;
mod delete;

pub fn router() -> Router {
    Router::new()
        .route("/", post(post::schedule))
        .route("/:schedule_id", patch(patch::schedule)
            .delete(delete::schedule)
            .get(get::schedule)
        )
        .layer(permission_required!(AuthGate, UserRole::Seller))
        .route("/", get(get::schedules))
}