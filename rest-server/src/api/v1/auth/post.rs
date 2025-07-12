use axum::http::StatusCode;
use axum::{Extension, Json};
use axum_garde::WithValidation;
use axum_login::tower_sessions::Session;
use axum_typed_multipart::TypedMultipart;
use garde::Validate;
use password_auth::verify_password;

use app_core::image::ImageManager;

use crate::app::auth::AuthSession;
use crate::app::server::AppState;
use crate::json::auth::{Credentials, LoginCreds, SignCreds};
use crate::json::error::ApiError;
use crate::models::users::LoginUser;

pub async fn login(
    mut auth_session: AuthSession,
    WithValidation(payload): WithValidation<Json<LoginCreds>>,
) -> Result<(), ApiError> {
    let user = auth_session.authenticate(
        Credentials::Password(payload.into_inner())
    )
        .await?
        .unwrap();

    auth_session.login(&user)
        .await?;
    Ok(())
}

pub async fn sign_in(
    Extension(state): Extension<AppState>,
    session: Session,
    mut auth_session: AuthSession,
    TypedMultipart(payload): TypedMultipart<SignCreds>,
) -> Result<StatusCode, ApiError> {
    if let Err(e) = payload.validate() {
        return Err(ApiError::Custom(StatusCode::BAD_REQUEST, format!("Campos inválidos: {e}")));
    }

    let mut tx = state.pool.begin().await?;

    let user = if let Ok(Some(oauth_token)) = session.remove::<String>("oauth.token").await {
        sqlx::query_as(
            r#"
                INSERT INTO users (email, name, access_token, roles)
                VALUES ($1, $2, $3, $4)
                ON CONFLICT(email) DO UPDATE
                SET access_token = excluded.access_token
                RETURNING
                    id, password,
                    roles, access_token
            "#,
        )
            .bind(payload.email)
            .bind(payload.name.to_lowercase())
            .bind(oauth_token)
            .bind(vec![payload.role.clone() as i16])
            .fetch_one(&mut *tx)
            .await?
    } else {
        let password = payload.password
            .ok_or(ApiError::Custom(StatusCode::BAD_REQUEST, "Uma senha deve ser fornecida".to_string()))?;

        let user = sqlx::query_as::<_, LoginUser>(
            r#"
            SELECT
                id, password,
                roles, access_token
            FROM USERS
            WHERE email = $1
        "#
        )
            .bind(&payload.email)
            .fetch_optional(&state.pool)
            .await?;

        if let Some(user) = user {
            if let Some(pass) = &user.password {
                return if verify_password(password, &pass).ok().is_some() {
                    auth_session.login(&user).await?;
                    Ok(StatusCode::CREATED)
                } else {
                    Err(ApiError::Custom(StatusCode::CONFLICT, "Conta já existe".to_string()))
                };
            }
        }

        sqlx::query_as::<_, LoginUser>(
            r#"
                INSERT INTO users (name, email, roles, password)
                VALUES ($1, $2, $3, $4)
                RETURNING id, password, roles, access_token
            "#
        )
            .bind(payload.name.to_lowercase())
            .bind(payload.email)
            .bind(vec![payload.role.clone() as i16])
            .bind(password_auth::generate_hash(password))
            .fetch_one(&mut *tx)
            .await?
    };

    if payload.role == 4 {
        sqlx::query(
            r#"
                INSERT INTO sellers (user_id) VALUES ($1)
            "#
        )
            .bind(user.id)
            .execute(&mut *tx)
            .await?;
    } else {
        sqlx::query(
            r#"
                INSERT INTO customers (user_id) VALUES ($1)
            "#
        )
            .bind(user.id)
            .execute(&mut *tx)
            .await?;
    }

    if let Some(avatar) = payload.image {
        let format = avatar.metadata.content_type
            .ok_or(ApiError::NotFound("Formato de imagem não encontrado".to_string()))?
            .to_string();
        let format = format
            .split('/')
            .last().unwrap();

        let path = &format!("{}/avatars/{}", &state.settings.web.cdn.storage, user.id);
        let path = std::path::Path::new(path);

        if !path.exists() {
            std::fs::create_dir(path)
                .map_err(|e| ApiError::Custom(StatusCode::INTERNAL_SERVER_ERROR, format!("Falha ao criar repositório: {e}")))?;
        }

        let hash = ImageManager::new(path).create_image(&format, avatar.contents, 400).await?;
        sqlx::query(
            r#"
                UPDATE users SET avatar = $1 WHERE id = $2
            "#
        )
            .bind(hash)
            .bind(user.id)
            .execute(&mut *tx)
            .await?;
    }

    tx.commit().await?;
    auth_session.login(&user).await?;
    Ok(StatusCode::CREATED)
}