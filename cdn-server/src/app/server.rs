use std::path::Path;

use axum::extract::{MatchedPath, Request};
use axum::http::{header, Method};
use axum::{Extension, Router};
use common::entities::Environment;
use common::settings::{AppSettings, Protocol};
use tower_http::cors::CorsLayer;
use tower_http::trace::TraceLayer;

use crate::routes;

#[derive(Clone)]
pub struct AppState {
    pub settings: AppSettings,
}

pub struct Server {
    pub state: AppState,
}

impl Server {
    pub async fn new() -> Self {
        let settings = AppSettings::new();

        Self::load_resources(&settings.web.cdn.storage, &settings.environment);

        Self {
            state: AppState {
                settings,
            }
        }
    }

    pub fn router(state: AppState) -> Router {
        Router::new()
            .merge(routes::router())
            .layer(Self::configure_cors(&state))
            .layer(Extension(state))
            .layer(
                TraceLayer::new_for_http()
                    .make_span_with(|req: &Request| {
                        let method = req.method();
                        let uri = req.uri();

                        let matched_path = req
                            .extensions()
                            .get::<MatchedPath>()
                            .map(|matched_path| matched_path.as_str());

                        tracing::debug_span!("request", %method, %uri, matched_path)
                    })
                    .on_failure(())
            )
    }

    pub async fn run(self) {
        log::info!("Starting axum server with tokio...");

        let listener = tokio::net::TcpListener::bind(self.state.settings.web.cdn.socket())
            .await
            .unwrap();
        axum::serve(listener, Self::router(self.state))
            .await
            .expect("Failed to start axum server");
    }

    fn configure_cors(state: &AppState) -> CorsLayer {
        CorsLayer::new()
            .allow_credentials(true)
            .allow_origin([
                state.settings.web.client.protocol_url().parse()
                    .unwrap()
            ])
            .allow_headers([
                header::CONTENT_TYPE
            ])
            .allow_methods([
                Method::GET, Method::PUT,
                Method::DELETE, Method::PATCH,
            ])
    }

    fn load_resources(storage_path: &String, env: &Environment) {
        let destination = format!("{storage_path}/resources");
        let destination = Path::new(destination.as_str());

        if destination.exists() {
            return;
        } else {
            std::fs::create_dir_all(destination).unwrap();
        }
        
        log::info!("Loading resources images");

        let resources = Path::new("cdn-server/resources");
        copy_dir_all(resources, destination).expect("Failed to load resources dir");

        if let Environment::Development = env {
            let destination = format!("{storage_path}");
            let destination = Path::new(destination.as_str());
            let resources = Path::new("rest-server/tests/resources");

            copy_dir_all(resources, destination).expect("Failed to load test resources");
        }
    }
}


fn copy_dir_all(src: impl AsRef<Path>, dst: impl AsRef<Path>) -> std::io::Result<()> {
    std::fs::create_dir_all(&dst)?;

    for entry in std::fs::read_dir(src)? {
        let entry = entry?;
        let ty = entry.file_type()?;

        if ty.is_dir() {
            copy_dir_all(entry.path(), dst.as_ref().join(entry.file_name()))?;
        } else {
            std::fs::copy(entry.path(), dst.as_ref().join(entry.file_name()))?;
        }
    }

    Ok(())
}

/*
fn process_directory(path: &Path, destination: &Path) {
    if !path.exists() {
        return;
    }

    if !destination.exists() {
        std::fs::create_dir(destination).unwrap();
    }

    log::info!("Loading images from {:?}", path);
    
    if let Ok(entries) = std::fs::read_dir(path) {
        for entry in entries {
            if let Ok(file) = entry {
                if file.file_type().unwrap().is_dir() {
                    process_directory(file.path().as_path(), destination.join(file.file_name()).as_path());
                } else {
                    let image = image::open(file.path()).unwrap();
                    let image = image.resize(512, 512, FilterType::Gaussian);

                    let name = file.file_name();
                    let name = name.to_str().unwrap().split(".").collect::<Vec<&str>>();

                    image.save_with_format(
                        destination.join(name.first().unwrap()), 
                        ImageFormat::from_extension(name.last().unwrap()).unwrap()
                    ).unwrap();
                }
            }
        }
    };
}*/