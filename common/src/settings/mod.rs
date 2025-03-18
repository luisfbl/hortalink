use crate::entities::Environment;
use crate::settings::database::DatabaseSettings;
use crate::settings::secrets::Secrets;
use crate::settings::services::{RabbitMQ, WebSocket};
use crate::settings::web::WebApp;

pub mod web;
pub mod database;
pub mod secrets;
pub mod services;

#[derive(Clone)]
pub struct AppSettings {
    pub web: WebApp,
    pub database: DatabaseSettings,
    pub rabbitmq: RabbitMQ,
    pub websocket: WebSocket,
    pub secrets: Secrets,
    pub environment: Environment,
}

pub trait Protocol {
    fn get_host(&self) -> &String;

    fn get_port(&self) -> u16;

    fn get_proxy(&self) -> String {
        self.socket()
    }

    fn socket(&self) -> String {
        let host = self.get_host();
        
        if host == "0.0.0.0" {
            return format!("localhost:{}", self.get_port())
        }
        
        format!("{}:{}", self.get_host(), self.get_port())
    }

    fn protocol_url(&self) -> String {
        let protocol = match self.get_port() {
            9002 => "ws",
            _ => "http",
        };

        format!("{}://{}", protocol, self.socket())
    }

    fn proxy_url(&self) -> String {
        let protocol = match self.get_port() {
            9002 => "ws",
            _ => "http",
        };

        format!("{}://{}", protocol, self.get_proxy())
    }
}

impl AppSettings {
    pub fn new() -> Self {
        Self {
            web: WebApp::new(),
            database: DatabaseSettings::new(),
            rabbitmq: RabbitMQ::new(),
            websocket: WebSocket::new(),
            secrets: Secrets::new(),
            environment: Default::default(),
        }
    }
}