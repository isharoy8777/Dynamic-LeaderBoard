# =============================================================================
# DOCKERFILE - Multi-stage build for production-ready Go application
# =============================================================================
# Uses multi-stage build to minimize final image size:
# - Build stage: Full Go toolchain for compilation
# - Production stage: Minimal Alpine image with just the binary
# =============================================================================

# Build stage
FROM golang:1.21-alpine AS builder

# Install git for fetching dependencies (if using private repos)
RUN apk add --no-cache git

# Set working directory
WORKDIR /app

# Copy go.mod and go.sum first for better layer caching
COPY go.mod go.sum ./

# Download dependencies (cached if go.mod/go.sum unchanged)
RUN go mod download

# Copy source code
COPY *.go ./

# Build the application
# CGO_ENABLED=0 produces a statically linked binary
# -ldflags="-s -w" strips debug info for smaller binary
RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-s -w" -o leaderboard .

# =============================================================================
# Production stage
# =============================================================================
FROM alpine:3.19

# Add ca-certificates for HTTPS and timezone data
RUN apk --no-cache add ca-certificates tzdata

# Create non-root user for security
RUN addgroup -g 1001 -S appgroup && \
    adduser -u 1001 -S appuser -G appgroup

WORKDIR /app

# Copy binary from builder stage
COPY --from=builder /app/leaderboard .

# Change ownership to non-root user
RUN chown -R appuser:appgroup /app

# Switch to non-root user
USER appuser

# Expose the application port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:8080/health || exit 1

# Run the application
CMD ["./leaderboard"]
