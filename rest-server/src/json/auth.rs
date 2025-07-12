use axum::body::Bytes;
use axum_typed_multipart::{FieldData, TryFromMultipart};
use garde::Validate;
use oauth2::CsrfToken;
use serde::{Deserialize, Serialize, Serializer};

#[derive(Debug, Clone, Deserialize)]
pub enum Credentials {
    Password(LoginCreds),
    OAuth(OAuthCreds),
}

#[derive(Debug, Clone, Deserialize)]
pub struct OAuthCreds {
    pub user: UserInfo,
    pub token: String,
}

#[derive(Debug, Clone, Deserialize, Serialize, Validate)]
pub struct LoginCreds {
    #[garde(email)]
    pub email: String,
    #[garde(length(min = 8, max = 64))]
    pub password: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct UserInfo {
    pub email: String,
    pub name: String,
    pub picture: Option<PictureVariant>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct PictureData {
    pub height: u32,
    pub is_silhouette: bool,
    pub url: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Picture {
    pub data: PictureData,
}

#[derive(Debug, Deserialize, Clone)]
#[serde(untagged)]
pub enum PictureVariant {
    Url(String),
    Data(Picture),
}

#[derive(Validate, TryFromMultipart)]
pub struct SignCreds {
    #[garde(skip)]
    pub name: String,
    #[garde(email)]
    pub email: String,
    #[garde(length(min = 8, max = 64))]
    pub password: Option<String>,
    #[garde(range(min = 3, max = 4))]
    pub role: i32,
    #[garde(skip)]
    #[form_data(limit = "15MiB")]
    pub image: Option<FieldData<Bytes>>,
}

#[derive(Serialize)]
pub struct AuthUrlResponse {
    pub auth_url: String,
}

#[derive(Debug, Clone, Deserialize)]
pub struct AuthzResp {
    pub state: CsrfToken,
    pub code: String,
}

#[derive(Debug, Clone, Deserialize, Validate)]
pub struct DeleteAccountRequest {
    #[garde(length(min = 8, max = 64))]
    pub password: Option<String>,
    #[garde(skip)]
    pub oauth_confirmation: Option<bool>,
}

impl Serialize for PictureVariant {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: Serializer,
    {
        match self {
            PictureVariant::Url(url) => serializer.serialize_str(&url),
            PictureVariant::Data(data) => serializer.serialize_str(&data.data.url),
        }
    }
}