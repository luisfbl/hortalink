use axum::Router;
use axum::routing::get;

mod get;
mod post;
mod messages;
mod patch;
mod chat_id;

pub fn router() -> Router {
    Router::new()
        .nest("/:chat_id/messages", messages::router())
        .route("/:chat_id", get(chat_id::get_chat))
        .route("/", get(get::chats)
            .post(post::chat)
            .patch(patch::chat),
        )
}