mod v1;

use axum::response::IntoResponse;
use axum::Router;
use axum::routing::get;

pub fn router() -> Router {
    Router::new()
        .nest("/v1", v1::router())
        .route("/health", get(|| async {
            return axum::http::StatusCode::OK.into_response()
        }))
}