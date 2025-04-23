use garde::Validate;
use serde::{Deserialize, Serialize};

use common::entities::WeekDay;
use crate::json::utils::Location;

#[derive(Serialize, Deserialize, Validate)]
#[garde(allow_unvalidated)]
pub struct CreateSchedulePayload {
    #[garde(dive)]
    pub location: Location,
    #[garde(length(min = 5, max = 256))]
    pub address: String,
    pub start_time: time::Time,
    pub end_time: time::Time,
    pub day_of_week: WeekDay,
}

#[derive(Serialize, Deserialize, Validate)]
#[garde(allow_unvalidated)]
pub struct UpdateSchedulePayload {
    #[garde(dive)]
    pub location: Option<Location>,
    #[garde(length(min = 5, max = 256))]
    pub address: Option<String>,
    pub start_time: Option<time::Time>,
    pub end_time: Option<time::Time>,
    pub day_of_week: Option<WeekDay>,
}

#[derive(Deserialize)]
pub struct ScheduleQuery {
    pub day_of_week: Option<WeekDay>,
    pub product_id: Option<i64>
}