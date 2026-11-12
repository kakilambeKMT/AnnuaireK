CREATE TABLE k_ads (
 id TEXT PRIMARY KEY, owner_id TEXT NOT NULL REFERENCES k_users(user_id),
 title TEXT NOT NULL, description TEXT NOT NULL, country TEXT NOT NULL, city TEXT NOT NULL,
 whatsapp TEXT NOT NULL, plan TEXT NOT NULL CHECK(plan IN ('free','boost','pro','advertiser')),
 method TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','quoted','published','rejected')),
 amount INTEGER, currency TEXT, instructions TEXT NOT NULL DEFAULT '',
 payment_reference TEXT UNIQUE, expires_at TEXT, created_at TEXT NOT NULL, updated_at TEXT NOT NULL
);
CREATE INDEX k_ads_public ON k_ads(status,expires_at);
CREATE INDEX k_ads_owner ON k_ads(owner_id);
