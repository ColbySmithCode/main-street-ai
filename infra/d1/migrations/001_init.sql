-- Main Street AI — initial schema
-- Run with: wrangler d1 execute main-street-ai --file=infra/d1/migrations/001_init.sql

-- Central org profile — seeded during onboarding, read by all modules
CREATE TABLE IF NOT EXISTS org_profiles (
  id          TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(8)))),
  name        TEXT NOT NULL,
  city        TEXT NOT NULL,
  state       TEXT,
  type        TEXT NOT NULL,
  website     TEXT,
  phone       TEXT,
  email       TEXT,
  description TEXT,
  created_at  INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at  INTEGER NOT NULL DEFAULT (unixepoch())
);

-- Presence: audit history
CREATE TABLE IF NOT EXISTS presence_audits (
  id           TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(8)))),
  org_id       TEXT REFERENCES org_profiles(id),
  grade        TEXT NOT NULL,
  score        INTEGER NOT NULL,
  full_report  TEXT NOT NULL,  -- JSON blob of full PresenceAudit
  generated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

-- Customers: contact list
CREATE TABLE IF NOT EXISTS contacts (
  id             TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(8)))),
  org_id         TEXT REFERENCES org_profiles(id),
  name           TEXT NOT NULL,
  business_name  TEXT,
  email          TEXT,
  phone          TEXT,
  notes          TEXT,
  lead_score     INTEGER,
  lead_tier      TEXT,
  last_contacted INTEGER,
  created_at     INTEGER NOT NULL DEFAULT (unixepoch())
);

-- Customers: outreach history
CREATE TABLE IF NOT EXISTS outreach_history (
  id          TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(8)))),
  org_id      TEXT REFERENCES org_profiles(id),
  contact_id  TEXT REFERENCES contacts(id),
  subject     TEXT,
  body        TEXT,
  status      TEXT NOT NULL DEFAULT 'draft',  -- draft | sent | replied
  sent_at     INTEGER,
  created_at  INTEGER NOT NULL DEFAULT (unixepoch())
);

-- Operations: appointments
CREATE TABLE IF NOT EXISTS appointments (
  id           TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(8)))),
  org_id       TEXT REFERENCES org_profiles(id),
  contact_id   TEXT REFERENCES contacts(id),
  scheduled_at INTEGER NOT NULL,
  duration_mins INTEGER NOT NULL DEFAULT 60,
  service      TEXT,
  status       TEXT NOT NULL DEFAULT 'confirmed',  -- confirmed | cancelled | completed | no-show
  notes        TEXT,
  created_at   INTEGER NOT NULL DEFAULT (unixepoch())
);

-- Operations: task inbox
CREATE TABLE IF NOT EXISTS tasks (
  id          TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(8)))),
  org_id      TEXT REFERENCES org_profiles(id),
  description TEXT NOT NULL,
  priority    TEXT,  -- do now | today | this week | delegate | drop
  due_at      INTEGER,
  completed   INTEGER NOT NULL DEFAULT 0,
  created_at  INTEGER NOT NULL DEFAULT (unixepoch())
);

-- Growth: content queue
CREATE TABLE IF NOT EXISTS content_queue (
  id           TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(8)))),
  org_id       TEXT REFERENCES org_profiles(id),
  platform     TEXT NOT NULL,
  content      TEXT NOT NULL,
  scheduled_at INTEGER,
  status       TEXT NOT NULL DEFAULT 'draft',  -- draft | approved | published | failed
  published_at INTEGER,
  created_at   INTEGER NOT NULL DEFAULT (unixepoch())
);

-- Capital: grant tracker
CREATE TABLE IF NOT EXISTS grant_tracker (
  id          TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(8)))),
  org_id      TEXT REFERENCES org_profiles(id),
  grant_name  TEXT NOT NULL,
  funder      TEXT,
  amount      TEXT,
  deadline    INTEGER,
  status      TEXT NOT NULL DEFAULT 'found',  -- found | researching | applying | submitted | awarded | rejected
  fit_score   INTEGER,
  notes       TEXT,
  url         TEXT,
  created_at  INTEGER NOT NULL DEFAULT (unixepoch())
);

-- Indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_contacts_org ON contacts(org_id);
CREATE INDEX IF NOT EXISTS idx_appointments_org_date ON appointments(org_id, scheduled_at);
CREATE INDEX IF NOT EXISTS idx_tasks_org_priority ON tasks(org_id, priority, completed);
CREATE INDEX IF NOT EXISTS idx_content_queue_status ON content_queue(org_id, status, scheduled_at);
CREATE INDEX IF NOT EXISTS idx_grants_org_deadline ON grant_tracker(org_id, deadline, status);
