package primarykeys

// BadSchema duplicates user attributes on every order and has no FK — updates and deletes corrupt history.
const BadSchema = `
-- Anti-pattern: "convenient" denormalization without constraints
CREATE TABLE orders (
    order_id     TEXT PRIMARY KEY,
    user_email   TEXT,
    user_name    TEXT,
    user_phone   TEXT,
    total_cents  INTEGER
);

-- Problems:
-- • Renaming a user requires scanning/updating every order row
-- • No guarantee user_email matches a real user row
-- • Orphan orders if "user" is deleted elsewhere
`
