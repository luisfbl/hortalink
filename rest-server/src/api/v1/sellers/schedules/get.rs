use crate::app::server::AppState;
use crate::json::error::ApiError;
use crate::json::schedules::ScheduleQuery;
use crate::models::schedules::Schedule;
use axum::extract::{Path, Query};
use axum::{Extension, Json};
use sqlx::QueryBuilder;

pub async fn schedules(
    Extension(state): Extension<AppState>,
    Path(seller_id): Path<i32>,
    Query(query): Query<ScheduleQuery>,
) -> Result<Json<Vec<Schedule>>, ApiError> {
    let mut sql_builder = QueryBuilder::new(
        r#"
        SELECT sc.id, pl.address, sc.start_time, sc.end_time, sc.day_of_week,
            ST_X(pl.geolocation) as longitude,
            ST_Y(pl.geolocation) as latitude
        FROM schedules sc
        JOIN places pl ON pl.id = sc.place
        "#
    );

    if let Some(product_id) = query.product_id {
        sql_builder.push(r#"
            INNER JOIN products_schedules ps ON ps.schedule_id = sc.id
                AND ps.seller_product_id =
        "#)
            .push_bind(product_id);
    }
    
    sql_builder.push(" WHERE sc.seller_id = ")
        .push_bind(seller_id);
    
    if let Some(day_of_week) = query.day_of_week {
        sql_builder.push("AND sc.day_of_week = ")
            .push_bind(day_of_week as i16);
    }

    let schedules: Vec<Schedule> = sql_builder.build_query_as()
        .fetch_all(&state.pool)
        .await?;

    Ok(Json(schedules))
}

pub async fn schedule(
    Extension(state): Extension<AppState>,
    Path(schedule_id): Path<i64>,
) -> Result<Json<Schedule>, ApiError> {
    let schedule = sqlx::query_as(
        r#"
        SELECT sc.id, pl.address, sc.start_time, sc.end_time, sc.day_of_week as "day_of_week: _",
            ST_X(pl.geolocation) as longitude,
            ST_Y(pl.geolocation) as latitude
        FROM schedules sc
        JOIN places pl ON pl.id = sc.place
        WHERE sc.id = $1
        "#
    )
        .bind(schedule_id)
        .fetch_one(&state.pool)
        .await?;

    Ok(Json(schedule))
}