# Stage 1: Builder - Foca em compilar o `rest-server` e suas dependências
FROM rust:latest AS builder

WORKDIR /app

COPY Cargo.toml ./
COPY common common/
COPY core core/
COPY rest-server rest-server/
COPY cdn-server cdn-server/
COPY websocket websocket/

RUN cargo build --release --workspace --target x86_64-unknown-linux-gnu

COPY . .

RUN cargo build --release --bin rest-server --target x86_64-unknown-linux-gnu

FROM debian:latest

RUN groupadd -r appuser && useradd -r -g appuser appuser
USER appuser

WORKDIR /app

COPY --from=builder /app/target/x86_64-unknown-linux-gnu/release/rest-server ./rest-server

EXPOSE 5443
CMD ["./rest-server"]