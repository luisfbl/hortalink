use std::env::var;

use crate::settings::Protocol;

#[derive(Clone)]
pub struct WebApp {
    pub rest: RestServer,
    pub client: WebClient,
    pub cdn: CdnServer,
}

#[derive(Clone)]
pub struct RestServer {
    pub host: String,
    pub port: u16,
    pub proxy: String,
}

#[derive(Clone)]
pub struct WebClient {
    pub host: String,
    pub port: u16,
    pub proxy: String,
}

#[derive(Clone)]
pub struct CdnServer {
    pub host: String,
    pub port: u16,
    pub storage: String,
    pub proxy: String,
}

impl WebApp {
    pub fn new() -> Self {
        Self {
            rest: RestServer::new(),
            client: WebClient::new(),
            cdn: CdnServer::new(),
        }
    }
}

impl Protocol for RestServer {
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

impl RestServer {
    fn new() -> Self {
        let proxy_host: String = var("DEFAULT_PROXY").unwrap();
        let proxy_port: u16 = var("DEFAULT_PROXY_PORT").unwrap().parse().unwrap();

        Self {
            host: var("REST_SERVER_HOST").unwrap(),
            port: var("REST_SERVER_PORT").unwrap().parse().unwrap(),
            proxy: format!("{proxy_host}:{proxy_port}"),
        }
    }
}

impl Protocol for WebClient {
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

impl WebClient {
    fn new() -> Self {
        Self {
            host: var("WEB_CLIENT_HOST").unwrap(),
            port: var("WEB_CLIENT_PORT").unwrap().parse().unwrap(),
            proxy: var("DEFAULT_PROXY").unwrap().parse().unwrap(),
        }
    }
}

impl Protocol for CdnServer {
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

impl CdnServer {
    fn new() -> Self {
        Self {
            host: var("CDN_SERVER_HOST").unwrap(),
            port: var("CDN_SERVER_PORT").unwrap().parse().unwrap(),
            storage: var("CDN_STORAGE_PATH").unwrap().parse().unwrap(),
            proxy: var("CDN_PROXY").unwrap().parse().unwrap(),
        }
    }
}
