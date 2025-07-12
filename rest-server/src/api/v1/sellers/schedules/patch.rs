use axum::{Extension, Json};
use axum::extract::Path;
use axum::http::StatusCode;
use axum_garde::WithValidation;

use crate::app::auth::AuthSession;
use crate::app::server::AppState;
use crate::json::error::ApiError;
use crate::json::schedules::UpdateSchedulePayload;
use crate::models::schedules::Schedule;

pub async fn schedule(
    Extension(state): Extension<AppState>,
    Path((seller_id, schedule_id)): Path<(i32, i32)>,
    auth_session: AuthSession,
    WithValidation(payload): WithValidation<Json<UpdateSchedulePayload>>,
) -> Result<(), ApiError> {
    let author = Schedule::get_author(&state.pool, schedule_id)
        .await?;
    
    if auth_session.user.unwrap().id != seller_id || seller_id != author {
        return Err(ApiError::Unauthorized("Você não pode fazer isso".to_string()))
    }

    let payload = payload.into_inner();
    
    if let Some(location) = payload.location.as_ref() {
        if location.latitude.is_none() || location.longitude.is_none() {
            return Err(ApiError::Custom(StatusCode::BAD_REQUEST, "Campos inválidos: latitude ou longitude faltando".to_string())); 
        }
    }

    let mut tx = state.pool.begin().await?;
    
    if let Some(location) = payload.location {
        let current_place_id: i64 = sqlx::query_scalar("SELECT place FROM schedules WHERE id = $1")
            .bind(schedule_id)
            .fetch_one(&mut *tx)
            .await?;
        
        let new_place_id = if let Some(nearby_place_id) = sqlx::query_scalar::<_, i64>(
            r#"
                SELECT id FROM places
                WHERE ST_DWithin(
                    ST_Transform(geolocation, 3857),
                    ST_Transform(ST_SetSRID(ST_MakePoint($1, $2), 4674), 3857),
                    100
                )
                AND id != $3
                ORDER BY ST_Distance(
                    ST_Transform(geolocation, 3857),
                    ST_Transform(ST_SetSRID(ST_MakePoint($1, $2), 4674), 3857)
                )
                LIMIT 1
            "#
        )
            .bind(location.longitude.unwrap())
            .bind(location.latitude.unwrap())
            .bind(current_place_id)
            .fetch_optional(&mut *tx)
            .await? {

            nearby_place_id
        } else {
            sqlx::query_scalar::<_, i64>(
                r#"
                    INSERT INTO places (geolocation, address)
                    VALUES (ST_SetSRID(ST_MakePoint($1, $2), 4674), $3)
                    RETURNING id
                "#
            )
                .bind(location.longitude.unwrap())
                .bind(location.latitude.unwrap())
                .bind(payload.address.as_ref().unwrap_or(&"".to_string()))
                .fetch_one(&mut *tx)
                .await?
        };

        sqlx::query(r#"
            UPDATE schedules
            SET
                place = $1,
                start_time = COALESCE($2, start_time),
                end_time = COALESCE($3, end_time),
                day_of_week = COALESCE($4, day_of_week)
            WHERE id = $5
        "#)
            .bind(new_place_id)
            .bind(payload.start_time)
            .bind(payload.end_time)
            .bind::<Option<i16>>(payload.day_of_week.map(|day| day.into()))
            .bind(schedule_id)
            .execute(&mut *tx)
            .await?;
    } else {
        sqlx::query(r#"
            UPDATE schedules
            SET
                start_time = COALESCE($1, start_time),
                end_time = COALESCE($2, end_time),
                day_of_week = COALESCE($3, day_of_week)
            WHERE id = $4
        "#)
            .bind(payload.start_time)
            .bind(payload.end_time)
            .bind::<Option<i16>>(payload.day_of_week.map(|day| day.into()))
            .bind(schedule_id)
            .execute(&mut *tx)
            .await?;
    }

    tx.commit().await?;

    Ok(())
}