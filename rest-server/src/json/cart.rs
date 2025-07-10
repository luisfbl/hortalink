use garde::Validate;
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Validate)]
pub struct PatchProductCart {
    #[garde(skip)]
    pub withdrawn: Option<i32>,
    #[garde(range(min = 1, max = 20))]
    pub amount: Option<i32>,
    #[garde(skip)]
    pub picked_up: Option<bool>,
    #[garde(skip)]
    pub pickup_date: Option<sqlx::types::chrono::NaiveDateTime>,
}

#[derive(Serialize, Deserialize, Validate)]
pub struct PostProductCart {
    #[garde(skip)]
    pub seller_product_id: i32,
    #[garde(skip)]
    pub withdrawn: Option<i64>,
    #[garde(range(min = 1, max = 20))]
    pub amount: i32,
    #[garde(skip)]
    pub picked_up: Option<bool>,
    #[garde(skip)]
    pub pickup_date: Option<sqlx::types::chrono::NaiveDateTime>,
}