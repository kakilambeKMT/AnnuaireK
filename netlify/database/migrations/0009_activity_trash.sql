CREATE TABLE IF NOT EXISTS k_activity_trash (
 id TEXT PRIMARY KEY,
 owner_id TEXT,
 reserved_email TEXT,
 data_json TEXT NOT NULL,
 status TEXT NOT NULL,
 revision INTEGER NOT NULL DEFAULT 1,
 created_at TEXT NOT NULL,
 updated_at TEXT NOT NULL,
 deleted_at TEXT NOT NULL,
 deleted_by TEXT NOT NULL,
 reason TEXT NOT NULL DEFAULT ''
);
CREATE INDEX IF NOT EXISTS k_activity_trash_deleted ON k_activity_trash(deleted_at);
