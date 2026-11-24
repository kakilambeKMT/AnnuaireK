CREATE TABLE IF NOT EXISTS k_activity_events (
 id TEXT PRIMARY KEY,
 activity_id TEXT NOT NULL,
 event TEXT NOT NULL CHECK(event IN ('view','contact','whatsapp','map')),
 actor_id TEXT,
 created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS k_activity_events_activity ON k_activity_events(activity_id,event,created_at);
