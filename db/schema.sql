CREATE TABLE IF NOT EXISTS learning_sessions (
 id uuid PRIMARY KEY,
 name text NOT NULL CHECK (length(trim(name)) BETWEEN 1 AND 80),
 created_at timestamptz NOT NULL DEFAULT now(),
 state jsonb NOT NULL DEFAULT '{"viewed":[],"practiced":[],"drafts":{}}'
);
CREATE TABLE IF NOT EXISTS algorithms (
 id text PRIMARY KEY,
 content jsonb NOT NULL
);
CREATE TABLE IF NOT EXISTS questions (
 id text PRIMARY KEY,
 algorithm_id text NOT NULL REFERENCES algorithms(id),
 purpose text NOT NULL CHECK (purpose IN ('diagnostic','final','exercise')),
 content jsonb NOT NULL
);
CREATE TABLE IF NOT EXISTS evaluations (
 id bigserial PRIMARY KEY,
 session_id uuid NOT NULL REFERENCES learning_sessions(id) ON DELETE CASCADE,
 kind text NOT NULL CHECK (kind IN ('diagnostic','final')),
 answers jsonb NOT NULL,
 correct integer NOT NULL,
 total integer NOT NULL CHECK(total > 0),
 created_at timestamptz NOT NULL DEFAULT now(),
 UNIQUE(session_id,kind)
);
CREATE TABLE IF NOT EXISTS exercise_attempts (
 id bigserial PRIMARY KEY,
 session_id uuid NOT NULL REFERENCES learning_sessions(id) ON DELETE CASCADE,
 question_id text NOT NULL REFERENCES questions(id),
 answer integer NOT NULL,
 correct boolean NOT NULL,
 created_at timestamptz NOT NULL DEFAULT now()
);
