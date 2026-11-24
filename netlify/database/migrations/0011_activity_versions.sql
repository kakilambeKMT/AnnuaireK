CREATE TABLE IF NOT EXISTS k_activity_versions (
 id TEXT PRIMARY KEY,
 activity_id TEXT NOT NULL,
 revision INTEGER NOT NULL,
 data_json TEXT NOT NULL,
 status TEXT NOT NULL,
 actor_id TEXT NOT NULL,
 created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS k_activity_versions_activity ON k_activity_versions(activity_id,revision DESC);
