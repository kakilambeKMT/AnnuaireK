CREATE TABLE IF NOT EXISTS k_conversations (
 id TEXT PRIMARY KEY NOT NULL,
 user_a TEXT NOT NULL REFERENCES k_users(user_id),
 user_b TEXT NOT NULL REFERENCES k_users(user_id),
 created_at TEXT NOT NULL,
 updated_at TEXT NOT NULL,
 CHECK(user_a < user_b),
 UNIQUE(user_a,user_b)
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS k_conversations_a_idx ON k_conversations(user_a,updated_at);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS k_conversations_b_idx ON k_conversations(user_b,updated_at);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS k_messages (
 id TEXT PRIMARY KEY NOT NULL,
 conversation_id TEXT NOT NULL REFERENCES k_conversations(id),
 sender_id TEXT NOT NULL REFERENCES k_users(user_id),
 body TEXT NOT NULL CHECK(length(body) BETWEEN 1 AND 4000),
 created_at TEXT NOT NULL,
 read_at TEXT
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS k_messages_conversation_idx ON k_messages(conversation_id,created_at);
