-- PulseDOT / Spotify clone — database schema
-- Idempotent: safe to run on every boot (the API runs it at startup too).

-- gen_random_uuid() is built into PostgreSQL 13+, pgcrypto keeps older versions working.
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username      VARCHAR(50)  UNIQUE NOT NULL,
  email         VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at    TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
