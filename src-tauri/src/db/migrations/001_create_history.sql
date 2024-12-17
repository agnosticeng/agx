CREATE TABLE IF NOT EXISTS history (
    ID INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp TEXT NOT NULL DEFAULT (datetime('now')),
    contents TEXT NOT NULL,
    response JSON NOT NULL,
    query_id INTEGER,
    query_hash TEXT NOT NULL,
    stats_execution_time INTEGER NOT NULL,
    stats_total_rows INTEGER NOT NULL CHECK (stats_total_rows >= 0)
);

CREATE INDEX IF NOT EXISTS idx_history_query_hash
ON history (query_hash);
