use axum::response::IntoResponse;
use axum::Router;
use axum::routing::get;

mod avatars;
mod products;
mod resources;

pub fn router() -> Router {
    Router::new()
        .nest("/avatars", avatars::router())
        .nest("/products", products::router())
        .nest("/resources", resources::router())
        .route("/health", get(|| async { 
            return axum::http::StatusCode::OK.into_response()
        }))
}