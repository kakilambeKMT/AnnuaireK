CREATE TABLE IF NOT EXISTS k_deletion_requests (
 id TEXT PRIMARY KEY,
 activity_id TEXT NOT NULL,
 requester_id TEXT NOT NULL,
 reason TEXT NOT NULL,
 status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','approved','rejected')),
 decision_reason TEXT NOT NULL DEFAULT '',
 decided_by TEXT,
 created_at TEXT NOT NULL,
 decided_at TEXT
);
CREATE INDEX IF NOT EXISTS k_deletion_requests_status ON k_deletion_requests(status,created_at);
