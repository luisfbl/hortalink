use axum::Router;
use axum::routing::{get, post};
use axum_login::login_required;
use crate::app::backend::Backend;
use crate::app::web::AppState;

mod post;
mod get;

pub fn router() -> Router<AppState> {
    Router::new()
        .route("/logout", get(get::logout))
        .route_layer(login_required!(Backend))
        .route("/login", post(post::login))
        .route("/sign-in", post(post::sign_in))
}