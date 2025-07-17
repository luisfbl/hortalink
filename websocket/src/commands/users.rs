use std::net::SocketAddr;

use sqlx::{Pool, Postgres};

use crate::json::GatewayRequest;
use crate::json::user::Record;
use crate::server::send_message;
use crate::server::session::SocketSession;

pub fn disconnect(addr: SocketAddr, connections: &mut Vec<SocketSession>) {
    let idx = match connections.iter().position(|session| session.addr == addr) {
        None => return,
        Some(value) => value
    };

    connections.remove(idx);
}

pub async fn identify(
    (addr, session_id): (SocketAddr, String),
    connections: &mut Vec<SocketSession>,
    pool: &Pool<Postgres>,
) {
    let idx = match connections.iter().position(|session| session.addr == addr) {
        None => return,
        Some(value) => value
    };

    let session_data: Option<Vec<u8>> = sqlx::query_scalar(
        r#"
            SELECT data FROM "tower_sessions"."sessions"
            WHERE id = $1
        "#
    )
        .bind(session_id)
        .fetch_optional(pool)
        .await
        .unwrap();

    if let Some(data) = session_data {
        let record = rmp_serde::from_slice::<Record>(&data);
        
        if let Ok(record) = record {
            let user_id = record
                .data["axum-login.data"]["user_id"].as_i64().unwrap() as i32;

            if let Some(session) = connections.iter().find(|session| session.user_id == Some(user_id)) {
                send_message(
                    &session.frame,
                    GatewayRequest { opcode: 8, d: None },
                )
            }

            connections[idx].user_id = Some(user_id);
        }
    }
}