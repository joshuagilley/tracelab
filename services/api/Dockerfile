# Build from repository root: docker build -f services/api/Dockerfile .
# Copies lab-authored Go from labs/design-patterns/concepts/ into the embed tree.

# ── Build stage ────────────────────────────────────
FROM golang:1.22-alpine AS builder

WORKDIR /app

COPY services/api/go.mod ./
RUN go mod download

COPY services/api/ ./
COPY labs/design-patterns/concepts/ internal/labs/embed/design-patterns/

RUN CGO_ENABLED=0 GOOS=linux go build -trimpath -o server ./cmd/server

# ── Runtime stage ───────────────────────────────────
# distroless has no shell — minimal attack surface
FROM gcr.io/distroless/static-debian12

COPY --from=builder /app/server /server

EXPOSE 8080
USER nonroot:nonroot
ENTRYPOINT ["/server"]
