# Build from repository root: docker build -f services/api/Dockerfile .
# Lesson source snippets (present/bad) ship from the web app; API serves JSON metadata only.

# ── Build stage ────────────────────────────────────
FROM golang:1.25-alpine AS builder

WORKDIR /app

COPY services/api/go.mod ./
RUN go mod download

COPY services/api/ ./

RUN CGO_ENABLED=0 GOOS=linux go build -trimpath -o server ./cmd/server

# ── Runtime stage ───────────────────────────────────
# base-debian12 (not static) includes CA certificates — required for MongoDB Atlas TLS.
# static-debian12 has no system trust store; drivers see Unknown / deadline during TLS handshake.
FROM gcr.io/distroless/base-debian12:nonroot

COPY --from=builder /app/server /server

EXPOSE 8080
ENTRYPOINT ["/server"]
