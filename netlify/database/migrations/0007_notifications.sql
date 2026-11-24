CREATE TABLE IF NOT EXISTS k_notifications (
 id TEXT PRIMARY KEY,
 user_id TEXT NOT NULL REFERENCES k_users(user_id) ON DELETE CASCADE,
 title TEXT NOT NULL,
 body TEXT NOT NULL,
 kind TEXT NOT NULL DEFAULT 'info',
 read_at TEXT,
 created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS k_notifications_user ON k_notifications(user_id,created_at);
