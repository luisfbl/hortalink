use serde::Serialize;
use sqlx::{Pool, Postgres};
use sqlx::types::time::Time;

use common::entities::WeekDay;

use crate::json::error::ApiError;
use crate::json::serialize_time;

#[derive(sqlx::FromRow, Serialize)]
pub struct Schedule {
    id: i64,
    address: String,
    #[serde(serialize_with = "serialize_time")]
    start_time: Time,
    #[serde(serialize_with = "serialize_time")]
    end_time: Time,
    #[sqlx(try_from = "i16")]
    day_of_week: WeekDay,
    longitude: f64,
    latitude: f64
}

impl Schedule {
    pub async fn get_author(
        pool: &Pool<Postgres>,
        schedule_id: i32,
    ) -> Result<i32, ApiError> {
        let user_id = sqlx::query_scalar::<_, i32>(
            r#"
                SELECT seller_id
                FROM schedules
                WHERE id = $1
            "#
        )
            .bind(schedule_id)
            .fetch_optional(pool)
            .await?;

        if user_id.is_none() {
            return Err(ApiError::NotFound("Agenda não encontrada".to_string()));
        }

        Ok(user_id.unwrap())
    }
}