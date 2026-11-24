CREATE TABLE k_community_posts (
 id TEXT PRIMARY KEY, owner_id TEXT NOT NULL REFERENCES k_users(user_id),
 kind TEXT NOT NULL CHECK(kind IN ('exchange','need')), title TEXT NOT NULL,
 description TEXT NOT NULL, display_name TEXT NOT NULL, city TEXT NOT NULL,
 country TEXT NOT NULL, category TEXT NOT NULL, details JSONB NOT NULL,
 status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','published','archived')),
 reason TEXT NOT NULL DEFAULT '', created_at TEXT NOT NULL
);
CREATE INDEX k_community_public ON k_community_posts(status,kind,created_at);
CREATE TABLE k_community_reactions (
 post_id TEXT REFERENCES k_community_posts(id), user_id TEXT REFERENCES k_users(user_id),
 kind TEXT CHECK(kind IN ('concerned','test','pay')), PRIMARY KEY(post_id,user_id,kind)
);
CREATE TABLE k_community_solutions (
 id TEXT PRIMARY KEY, post_id TEXT REFERENCES k_community_posts(id),
 owner_id TEXT REFERENCES k_users(user_id), body TEXT NOT NULL,
 status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','published','archived')),
 created_at TEXT NOT NULL
);
CREATE TABLE k_time_sessions (
 id TEXT PRIMARY KEY, post_id TEXT REFERENCES k_community_posts(id),
 provider_id TEXT REFERENCES k_users(user_id), learner_id TEXT REFERENCES k_users(user_id),
 minutes INTEGER NOT NULL CHECK(minutes IN (30,60)), objective TEXT NOT NULL,
 appointment TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'requested'
 CHECK(status IN ('requested','accepted','completed','cancelled')),
 provider_confirmed BOOLEAN NOT NULL DEFAULT false, learner_confirmed BOOLEAN NOT NULL DEFAULT false,
 created_at TEXT NOT NULL, CHECK(provider_id<>learner_id)
);
CREATE UNIQUE INDEX k_time_open_request ON k_time_sessions(post_id,learner_id) WHERE status IN ('requested','accepted');
CREATE TABLE k_time_ledger (
 session_id TEXT REFERENCES k_time_sessions(id), user_id TEXT REFERENCES k_users(user_id),
 minutes INTEGER NOT NULL, PRIMARY KEY(session_id,user_id)
);
CREATE TABLE k_community_reports (
 post_id TEXT REFERENCES k_community_posts(id), user_id TEXT REFERENCES k_users(user_id),
 reason TEXT NOT NULL, created_at TEXT NOT NULL, PRIMARY KEY(post_id,user_id)
);
