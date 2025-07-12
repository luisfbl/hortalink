use axum::{Extension, Json};
use axum::extract::Path;
use axum::http::StatusCode;
use axum_garde::WithValidation;

use crate::app::auth::AuthSession;
use crate::app::server::AppState;
use crate::json::error::ApiError;
use crate::json::schedules::CreateSchedulePayload;

pub async fn schedule(
    Extension(state): Extension<AppState>,
    Path(seller_id): Path<i32>,
    auth_session: AuthSession,
    WithValidation(payload): WithValidation<Json<CreateSchedulePayload>>,
) -> Result<StatusCode, ApiError> {
    if auth_session.user.unwrap().id != seller_id {
        return Err(ApiError::Unauthorized("Você não pode fazer isso".to_string()))
    }
    
    let payload = payload.into_inner();
    let mut tx = state.pool.begin().await?;

    let existing_place = sqlx::query_scalar::<_, i64>(
        r#"
            SELECT id FROM places
            WHERE ST_DWithin(
                ST_Transform(geolocation, 3857),
                ST_Transform(ST_SetSRID(ST_MakePoint($1, $2), 4674), 3857),
                100
            )
            ORDER BY ST_Distance(
                ST_Transform(geolocation, 3857),
                ST_Transform(ST_SetSRID(ST_MakePoint($1, $2), 4674), 3857)
            )
            LIMIT 1
        "#
    )
        .bind(payload.location.longitude)
        .bind(payload.location.latitude)
        .fetch_optional(&mut *tx)
        .await?;

    let place_id = if let Some(id) = existing_place {
        id
    } else {
        sqlx::query_scalar::<_, i64>(
            r#"
                INSERT INTO places (geolocation, address)
                VALUES (ST_SetSRID(ST_MakePoint($1, $2), 4674), $3)
                RETURNING id
            "#
        )
            .bind(payload.location.longitude)
            .bind(payload.location.latitude)
            .bind(&payload.address)
            .fetch_one(&mut *tx)
            .await?
    };

    sqlx::query(
        r#"
            INSERT INTO schedules (place, start_time, end_time, day_of_week, seller_id)
            VALUES ($1, $2, $3, $4, $5)
        "#
    )
        .bind(place_id)
        .bind(payload.start_time)
        .bind(payload.end_time)
        .bind(payload.day_of_week as i16)
        .bind(seller_id)
        .execute(&mut *tx)
        .await?;

    tx.commit().await?;

    Ok(StatusCode::CREATED)
}