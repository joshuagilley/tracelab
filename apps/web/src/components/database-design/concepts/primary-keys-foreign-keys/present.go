package primarykeys

// GoodSchema is illustrative DDL: surrogate PKs, FK from orders → users, no duplicated profile columns.
const GoodSchema = `
-- Users are identified once; orders reference them by id.
CREATE TABLE users (
    id          BIGSERIAL PRIMARY KEY,
    email       TEXT NOT NULL UNIQUE,
    display_name TEXT NOT NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE orders (
    id           BIGSERIAL PRIMARY KEY,
    user_id      BIGINT NOT NULL REFERENCES users (id) ON DELETE RESTRICT,
    total_cents  INTEGER NOT NULL CHECK (total_cents >= 0),
    placed_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX orders_user_placed_idx ON orders (user_id, placed_at DESC);
`
