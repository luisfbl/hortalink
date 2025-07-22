FROM rust:1.88.0 AS builder

WORKDIR /app

COPY Cargo.toml ./
COPY common common/
COPY core core/
COPY rest-server rest-server/
COPY cdn-server cdn-server/
COPY websocket websocket/

RUN cargo build --release --workspace --target x86_64-unknown-linux-gnu

COPY . .

RUN cargo build --release --bin websocket --target x86_64-unknown-linux-gnu

FROM debian:12.11

RUN groupadd -r appuser && useradd -r -g appuser appuser
USER appuser

WORKDIR /app

COPY --from=builder /app/target/x86_64-unknown-linux-gnu/release/websocket ./websocket

EXPOSE 9002
CMD ["./websocket"]