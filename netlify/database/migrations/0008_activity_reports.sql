CREATE TABLE IF NOT EXISTS k_activity_reports (
 id TEXT PRIMARY KEY,
 activity_id TEXT NOT NULL,
 reporter_id TEXT NOT NULL REFERENCES k_users(user_id) ON DELETE CASCADE,
 reason TEXT NOT NULL,
 status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','reviewed','dismissed')),
 moderator_note TEXT NOT NULL DEFAULT '',
 reviewed_by TEXT,
 created_at TEXT NOT NULL,
 reviewed_at TEXT,
 UNIQUE(activity_id,reporter_id)
);
CREATE INDEX IF NOT EXISTS k_activity_reports_status ON k_activity_reports(status,created_at);
