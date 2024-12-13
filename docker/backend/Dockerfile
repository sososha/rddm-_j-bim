# Build stage
FROM rust:1.75-slim AS builder

WORKDIR /usr/src/app

# Install build dependencies
RUN apt-get update && \
    apt-get install -y pkg-config libssl-dev && \
    rm -rf /var/lib/apt/lists/*

# Create blank project
RUN cargo new --bin rddm-backend
WORKDIR /usr/src/app/rddm-backend

# Copy manifests
COPY Cargo.lock Cargo.toml ./

# Build dependencies
RUN cargo build --release
RUN rm src/*.rs

# Copy source code
COPY src ./src

# Build application
RUN cargo build --release

# Production stage
FROM debian:bookworm-slim

WORKDIR /usr/local/bin

# Install runtime dependencies
RUN apt-get update && \
    apt-get install -y libssl3 && \
    rm -rf /var/lib/apt/lists/*

# Copy binary
COPY --from=builder /usr/src/app/rddm-backend/target/release/rddm-backend .

# Expose port
EXPOSE 3000

# Start application
CMD ["rddm-backend"]
