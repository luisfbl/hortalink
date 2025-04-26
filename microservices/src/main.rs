use common::entities::CartStatus;
use common::settings::database::DatabaseSettings;
use std::time::Duration;
use sqlx::postgres::PgPoolOptions;
use tokio::time;

const DEFAULT_CHECKOUT_TIMEOUT_DAYS: u64 = 3;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    dotenv::dotenv()
        .expect("Failed to load .env file");
    let database_settings = DatabaseSettings::new();

    let pool = PgPoolOptions::new()
        .max_connections(5)
        .connect(&database_settings.url())
        .await?;

    println!("Cart status microservice started");
    println!("Checking for abandoned orders every 12 hours");

    loop {
        match update_abandoned_orders(&pool).await {
            Ok(count) => {
                if count > 0 {
                    println!("Updated {} abandoned orders", count);
                }
            }
            Err(e) => eprintln!("Error updating abandoned orders: {}", e),
        }

        // Sleep for 12 hours before the next check
        time::sleep(Duration::from_secs(12 * 60 * 60)).await;
    }
}

async fn update_abandoned_orders(pool: &sqlx::Pool<sqlx::Postgres>) -> Result<u64, sqlx::Error> {
    let timeout_days = std::env::var("CHECKOUT_TIMEOUT_DAYS")
        .ok()
        .and_then(|val| val.parse::<u64>().ok())
        .unwrap_or(DEFAULT_CHECKOUT_TIMEOUT_DAYS);

    let result = sqlx::query(
        r#"
        UPDATE cart
        SET status = $1
        WHERE status IN ($2, $3)
          AND created_at < (CURRENT_TIMESTAMP - INTERVAL '1 day' * $4)
          AND withdrawn IS NULL
        "#
    )
    .bind(CartStatus::Abandoned as i16)
    .bind(CartStatus::Pending as i16)
    .bind(CartStatus::Confirmed as i16)
    .bind(timeout_days as i32)
    .execute(pool)
    .await?;

    Ok(result.rows_affected())
}