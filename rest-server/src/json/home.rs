use serde::Serialize;
use sqlx::types::chrono::{DateTime, NaiveDateTime, Utc};
use crate::models::products::SellerProductPreview;
use crate::models::users::PreviewUser;
use sqlx::types::Decimal;

#[derive(Serialize)]
pub struct Home {
    pub role: i16,
    pub recents: Option<Vec<SellerProductPreview>>,
    pub more_orders: Option<Vec<SellerProductPreview>>,
    pub recommendations: Option<Vec<PreviewUser>>
}

#[derive(Serialize)]
pub struct SellerHomeStats {
    pub monthly_revenue: Decimal,
    pub total_orders: i64,
    pub pending_orders: i64,
    pub top_products: Vec<SellerTopProduct>,
    pub recent_orders: Vec<SellerRecentOrder>
}

#[derive(sqlx::FromRow, Serialize)]
pub struct SellerTopProduct {
    pub id: i64,
    pub name: String,
    pub photo: String,
    pub sold_quantity: i64,
    pub revenue: Decimal
}

#[derive(sqlx::FromRow, Serialize)]
pub struct SellerRecentOrder {
    pub id: i64,
    pub customer_id: i32,
    pub customer_name: String,
    pub customer_avatar: Option<String>,
    pub product_name: String,
    pub amount: i64,
    pub created_at: NaiveDateTime,
    pub status: i16
}