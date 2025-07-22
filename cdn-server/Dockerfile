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
COPY cdn-server/resources cdn-server/resources

RUN cargo build --release --bin cdn-server --target x86_64-unknown-linux-gnu

FROM debian:12.11

RUN groupadd -r appuser && useradd -r -g appuser appuser
RUN mkdir -p /data/cdn_storage /data/cdn_storage/avatars /data/cdn_storage/products \
    && chown -R appuser:appuser /data/cdn_storage

USER appuser

WORKDIR /app

COPY --from=builder /app/cdn-server/resources /data/cdn_storage/resources
COPY --from=builder /app/target/x86_64-unknown-linux-gnu/release/cdn-server ./cdn-server/cdn-server

EXPOSE 5767
CMD ["./cdn-server/cdn-server"]