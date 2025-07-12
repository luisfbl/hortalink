use axum::body::Bytes;
use axum_typed_multipart::{FieldData, TryFromMultipart};
use garde::Validate;
use serde::{Deserialize, Serialize};
use sqlx::types::Decimal;

use common::entities::{StarRating, WeekDay};

use crate::json::deserialize_array;
use crate::json::validate_price;
use crate::models::products::SellerProduct;
use crate::models::users::PreviewUser;

#[derive(Serialize)]
pub struct SellerProductResponse {
    pub product: SellerProduct,
    pub schedules: Vec<i64>,
    pub seller: PreviewUser,
}

#[derive(TryFromMultipart, Validate)]
pub struct PostSellerProduct {
    #[garde(range(min = 0))]
    pub product_id: i32,
    #[garde(range(min = 0.1))]
    pub price: f64,
    #[garde(range(min = 1))]
    pub quantity: Option<i16>,
    #[form_data(limit = "25MiB")]
    #[garde(length(min = 1, max = 5))]
    pub photos: Vec<FieldData<Bytes>>,
    #[garde(length(max = 5))]
    pub schedules_id: Vec<i32>,
    #[garde(range(min = 0, max = 5))]
    pub unit: i16,
    #[garde(range(min = 0.0))]
    pub unit_quantity: f64,
    #[garde(length(min = 0, max = 2096))]
    pub description: Option<String>,
}

#[derive(TryFromMultipart, Validate)]
pub struct PatchSellerProduct {
    #[garde(range(min = 0.1))]
    pub price: Option<f64>,
    #[garde(range(min = 1))]
    pub quantity: Option<i16>,
    #[garde(range(min = 0, max = 5))]
    pub unit: Option<i16>,
    #[garde(range(min = 0.0))]
    pub unit_quantity: Option<f64>,
    #[form_data(limit = "25MiB")]
    #[garde(skip)]
    pub add_photos: Vec<FieldData<Bytes>>,
    #[garde(skip)]
    pub remove_photos: Vec<String>,
    #[garde(skip)]
    pub add_schedules: Vec<i32>,
    #[garde(skip)]
    pub remove_schedules: Vec<i32>,
    #[garde(length(min = 10, max = 2096))]
    pub description: Option<String>,
}

#[derive(Serialize, Deserialize, Validate)]
pub struct FilterProducts {
    #[garde(custom(validate_price))]
    pub max_price: Option<Decimal>,
    #[garde(custom(validate_price))]
    pub min_price: Option<Decimal>,
    #[garde(skip)]
    pub min_stars: Option<StarRating>,
    #[garde(range(min = 1, max = 100))]
    pub product_type: Option<i32>,
    #[garde(skip)]
    pub start_time: Option<time::Time>,
    #[garde(range(min = 1))]
    pub product_id: Option<i32>,
    #[garde(skip)]
    pub day_of_week: Option<WeekDay>,
    #[garde(range(min = 1, max = 100))]
    pub page: i16,
    #[garde(range(min = 5, max = 100))]
    pub per_page: i16,
    #[garde(range(min = - 90.0000000, max = 90.0000000))]
    pub latitude: Option<f64>,
    #[garde(range(min = - 180.0000000, max = 180.0000000))]
    pub longitude: Option<f64>,
    #[garde(range(min = 1.0, max = 45.0))]
    pub distance: Option<f32>
}

#[derive(Deserialize, Validate)]
pub struct FilterResources {
    #[garde(alphanumeric)]
    #[garde(length(min = 1, max = 20))]
    pub query: Option<String>,
    #[garde(range(min = 1, max = 100))]
    pub page: i16,
    #[garde(range(min = 5, max = 100))]
    pub per_page: i16,
}

#[derive(Deserialize, Validate)]
pub struct ProductDistanceQuery {
    #[garde(length(min = 1, max = 100))]
    #[serde(deserialize_with = "deserialize_array")]
    pub products_id: Vec<i64>,
    #[garde(range(min = - 90.0000000, max = 90.0000000))]
    pub latitude: f64,
    #[garde(range(min = - 180.0000000, max = 180.0000000))]
    pub longitude: f64,
}