use crate::settings::Protocol;
use std::env::var;

#[derive(Clone)]
pub struct WebSocket {
    pub host: String,
    pub port: u16,
    pub proxy: String,
}

impl Protocol for WebSocket {
    fn get_host(&self) -> &String {
        &self.host
    }

    fn get_port(&self) -> u16 {
        self.port
    }

    fn get_proxy(&self) -> String {
        self.proxy.clone()
    }
}

impl WebSocket {
    pub fn new() -> Self {
        Self {
            host: var("WEBSOCKET_HOST")
                .unwrap(),
            port: var("WEBSOCKET_PORT")
                .unwrap_or("9002".to_string())
                .parse().unwrap(),
            proxy: var("WEBSOCKET_PROXY")
                .unwrap()
                .parse().unwrap(),
        }
    }
}