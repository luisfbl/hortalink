mod get;
mod post;
mod delete;

use axum::Router;
use axum::routing::{get, post, delete};
use axum_login::login_required;
use crate::app::auth::AuthGate;

pub fn router() -> Router {
    Router::new()
        .route("/logout", get(get::logout))
        .route("/account", delete(delete::delete_account))
        .route_layer(login_required!(AuthGate))
        .route("/login", post(post::login))
        .route("/sign-in", post(post::sign_in))
}