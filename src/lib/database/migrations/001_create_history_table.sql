CREATE TABLE IF NOT EXISTS history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  timestamp TEXT NOT NULL DEFAULT (datetime('now')),
  content TEXT NOT NULL,
  execution_time INTEGER NOT NULL,
  total_rows INTEGER NOT NULL CHECK (total_rows >= 0)
);
