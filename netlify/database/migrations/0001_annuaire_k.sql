CREATE TABLE k_users (
 user_id TEXT PRIMARY KEY NOT NULL,
 email TEXT NOT NULL UNIQUE,
 role TEXT NOT NULL DEFAULT 'member' CHECK(role IN ('owner','admin','moderator','member')),
 created_at TEXT NOT NULL
);
--> statement-breakpoint
CREATE TABLE k_activities (
 id TEXT PRIMARY KEY NOT NULL,
 owner_id TEXT REFERENCES k_users(user_id),
 reserved_email TEXT,
 data_json TEXT NOT NULL,
 status TEXT NOT NULL DEFAULT 'draft' CHECK(status IN ('draft','pending','published','changes_requested','archived')),
 revision INTEGER NOT NULL DEFAULT 1,
 review_reason TEXT NOT NULL DEFAULT '',
 created_at TEXT NOT NULL,
 updated_at TEXT NOT NULL
);
--> statement-breakpoint
CREATE INDEX k_activities_owner_idx ON k_activities(owner_id);
--> statement-breakpoint
CREATE INDEX k_activities_status_idx ON k_activities(status,updated_at);
--> statement-breakpoint
CREATE TABLE k_audit (
 id TEXT PRIMARY KEY NOT NULL,
 actor_id TEXT NOT NULL,
 action TEXT NOT NULL,
 target_id TEXT NOT NULL,
 detail TEXT NOT NULL DEFAULT '',
 created_at TEXT NOT NULL
);
--> statement-breakpoint
CREATE TABLE k_rate_limits (
 key TEXT PRIMARY KEY NOT NULL,
 count INTEGER NOT NULL DEFAULT 1,
 reset_at BIGINT NOT NULL
);
