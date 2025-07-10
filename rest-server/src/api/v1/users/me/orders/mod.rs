mod get;
mod delete;
mod patch;

use axum::Router;
use axum::routing::{delete, get, patch};
use axum_login::permission_required;
use common::entities::UserRole;
use crate::app::auth::AuthGate;

pub fn router() -> Router {
    Router::new()
        .route("/", get(get::orders))
        .route("/:order_id", delete(delete::order))
        .route("/:order_id", patch(patch::pickup_status))
        //.layer(permission_required!(AuthGate, UserRole::Seller))
        .route("/:order_id", get(get::order))
}