# ── Build stage ────────────────────────────────────
FROM golang:1.22-alpine AS builder

WORKDIR /app

COPY go.mod ./
RUN go mod download

COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -trimpath -o server ./cmd/server

# ── Runtime stage ───────────────────────────────────
# distroless has no shell — minimal attack surface
FROM gcr.io/distroless/static-debian12

COPY --from=builder /app/server /server

EXPOSE 8080
USER nonroot:nonroot
ENTRYPOINT ["/server"]
