CREATE TABLE IF NOT EXISTS expenses (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  amount      INTEGER NOT NULL CHECK (amount > 0),
  -- stored as cents; e.g., ₹150.75 → 15075
  -- All reads divide by 100; all writes multiply by 100.
  category    TEXT    NOT NULL,
  description TEXT    NOT NULL DEFAULT '',
  date        TEXT    NOT NULL,   -- ISO-8601: YYYY-MM-DD
  created_at  TEXT    NOT NULL DEFAULT (datetime('now')),
  idempotency_key TEXT UNIQUE     -- nullable, but unique when present
);

CREATE INDEX IF NOT EXISTS idx_expenses_category ON expenses(category);
CREATE INDEX IF NOT EXISTS idx_expenses_date     ON expenses(date DESC);
