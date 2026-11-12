CREATE TABLE IF NOT EXISTS k_trust (
 activity_id TEXT PRIMARY KEY REFERENCES k_activities(id), verified INTEGER NOT NULL DEFAULT 0,
 verified_at TEXT, verification_note TEXT NOT NULL DEFAULT '', sanction TEXT NOT NULL DEFAULT 'none' CHECK(sanction IN ('none','demote','warning','suspend','ban')),
 reason TEXT NOT NULL DEFAULT '', until_at TEXT, updated_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS k_contacts (
 id TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES k_users(user_id), activity_id TEXT NOT NULL REFERENCES k_activities(id),
 kind TEXT NOT NULL CHECK(kind IN ('contact','appointment')), status TEXT NOT NULL DEFAULT 'open' CHECK(status IN ('open','rated','no_exchange')), created_at TEXT NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS k_contacts_one_open ON k_contacts(user_id) WHERE status='open';
CREATE TABLE IF NOT EXISTS k_feedback (
 user_id TEXT NOT NULL REFERENCES k_users(user_id), activity_id TEXT NOT NULL REFERENCES k_activities(id), score INTEGER NOT NULL CHECK(score BETWEEN 1 AND 5), updated_at TEXT NOT NULL,
 PRIMARY KEY(user_id,activity_id)
);
CREATE TABLE IF NOT EXISTS k_appeals (
 id TEXT PRIMARY KEY, activity_id TEXT NOT NULL REFERENCES k_activities(id), owner_id TEXT NOT NULL REFERENCES k_users(user_id), message TEXT NOT NULL, created_at TEXT NOT NULL
);
