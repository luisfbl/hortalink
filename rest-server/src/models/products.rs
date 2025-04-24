use serde::Serialize;
use sqlx::{Pool, Postgres};
use sqlx::types::chrono::NaiveDateTime;
use sqlx::types::Decimal;

use crate::json::error::ApiError;
use crate::json::serialize_timestamp;
use crate::json::serialize_unit;
use crate::json::serialize_price;
use crate::json::serialize_rating;

#[derive(sqlx::FromRow, Serialize)]
pub struct SellerProduct {
    id: i64,
    #[sqlx(flatten)]
    product: Product,
    photos: Vec<String>,
    quantity: Option<i16>,
    #[serde(serialize_with = "serialize_price")]
    price: Decimal,
    #[serde(serialize_with = "serialize_rating")]
    rating: Option<f64>,
    rating_quantity: Option<i32>,
    description: Option<String>,
    #[serde(serialize_with = "serialize_unit")]
    unit: i16,
    unit_quantity: f32,
    #[serde(skip_serializing)]
    #[sqlx(default)]
    pub seller_id: Option<i32>
}

#[derive(sqlx::FromRow, Serialize)]
pub struct SellerProductPreview {
    id: i64,
    #[sqlx(flatten)]
    product: Product,
    #[serde(serialize_with = "serialize_price")]
    price: Decimal,
    #[serde(serialize_with = "serialize_rating")]
    rating: Option<f64>,
    rating_quantity: Option<i32>,
    photo: String,
    #[serde(serialize_with = "serialize_unit")]
    unit: i16,
    unit_quantity: Option<f32>,
}

#[derive(sqlx::FromRow, Serialize)]
pub struct SellerProductMinimal {
    #[sqlx(rename = "product_id")]
    id: i64,
    #[sqlx(rename = "product_name")]
    name: String,
    photo: String,
    #[sqlx(default)]
    price: Option<Decimal>
}

#[derive(sqlx::FromRow, Serialize)]
pub struct Product {
    #[sqlx(rename = "product_id")]
    id: i32,
    name: String,
}

#[derive(sqlx::FromRow, Serialize)]
pub struct ProductComment {
    id: i64,
    author_id: i32,
    #[serde(serialize_with = "serialize_timestamp")]
    created_at: NaiveDateTime,
    was_edited: Option<bool>,
    rating: i16,
    content: Option<String>,
}

#[derive(sqlx::FromRow, Serialize)]
pub struct ResourceProduct {
    product_id: i32,
    product_name: String,
    alias: Vec<String>,
    category_name: String,
    category_id: i32
}

#[derive(sqlx::FromRow, Serialize)]
pub struct ProductDistance {
    pub id: i64,
    pub dist: f64
}

impl SellerProduct {
    pub async fn get_author(
        pool: &Pool<Postgres>,
        product_id: i32,
    ) -> Result<i32, ApiError> {
        let user_id = sqlx::query_scalar::<_, i32>(
            r#"
                SELECT seller_id FROM seller_products
                WHERE id = $1
            "#
        )
            .bind(product_id)
            .fetch_optional(pool)
            .await?;

        if user_id.is_none() {
            return Err(ApiError::NotFound("Produto não encontrado".to_string()));
        }

        Ok(user_id.unwrap())
    }
}