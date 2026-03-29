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
FROM gcr.io/distroless/static-debian12

COPY --from=builder /app/server /server

EXPOSE 8080
USER nonroot:nonroot
ENTRYPOINT ["/server"]
