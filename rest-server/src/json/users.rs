use axum::body::Bytes;
use axum_typed_multipart::{FieldData, TryFromMultipart};
use garde::Validate;
use serde::{Deserialize, Serialize, Serializer};
use crate::models::cart::OrderPreview;
use crate::models::customers::CustomerUser;
use crate::models::products::SellerProductPreview;
use crate::models::ratings::{CustomerRating, ProductRatingInfo};
use crate::models::sellers::{PublicProfile, SellerUser, UserSettingsProfile};
use crate::models::users::ViewerUser;

#[derive(Validate, TryFromMultipart)]
pub struct PatchUserMe {
    #[garde(skip)]
    #[form_data(limit = "15MiB")]
    pub image: Option<FieldData<Bytes>>,
    #[garde(length(min = 5, max = 64))]
    pub name: Option<String>,
    #[garde(length(min = 11, max = 11))]
    pub phone: Option<String>,
    #[garde(email)]
    pub email: Option<String>,
    #[garde(length(min = 8))]
    pub current_password: Option<String>,
    #[garde(length(min = 8))]
    pub new_password: Option<String>,
    #[garde(skip)]
    pub email_notifications: Option<bool>,
    #[garde(skip)]
    pub push_notifications: Option<bool>,
}

#[derive(Serialize)]
pub struct UserResponse {
    pub profile: PublicProfile,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub orders: Option<Vec<OrderPreview>>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub reviews: Option<Vec<ProductRatingInfo>>,
    #[serde(skip_serializing_if = "Option::is_none")]
    #[serde(rename = "reviews")]
    pub customer_reviews: Option<Vec<CustomerRating>>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub products: Option<Vec<SellerProductPreview>>,
}

#[derive(Serialize)]
pub struct UserSettingsResponse {
    pub profile: UserSettingsProfile,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub orders: Option<Vec<OrderPreview>>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub reviews: Option<Vec<ProductRatingInfo>>,
    #[serde(skip_serializing_if = "Option::is_none")]
    #[serde(rename = "reviews")]
    pub customer_reviews: Option<Vec<CustomerRating>>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub products: Option<Vec<SellerProductPreview>>,
}

#[derive(Deserialize, Validate)]
pub struct FilterUsers {
    #[garde(length(min = 3, max = 64))]
    pub query: Option<String>,
    #[garde(range(min = 1, max = 100))]
    pub page: i16,
    #[garde(range(min = 5, max = 100))]
    pub per_page: i16,
}

pub enum UserType {
    Customer(CustomerUser),
    Seller(SellerUser),
    Viewer(ViewerUser),
}

impl Serialize for UserType {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: Serializer,
    {
        match self {
            UserType::Customer(user) => user.serialize(serializer),
            UserType::Seller(user) => user.serialize(serializer),
            UserType::Viewer(user) => user.serialize(serializer),
        }
    }
}