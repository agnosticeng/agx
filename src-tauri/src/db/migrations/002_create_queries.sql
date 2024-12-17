CREATE TABLE IF NOT EXISTS queries (
    ID INTEGER PRIMARY KEY AUTOINCREMENT,
    display_name TEXT NOT NULL,
    contents TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TRIGGER IF NOT EXISTS update_queries_updated_at
AFTER UPDATE ON queries
FOR EACH ROW
BEGIN
    UPDATE queries
    SET updated_at = datetime('now')
    WHERE ID = OLD.ID;
END;
