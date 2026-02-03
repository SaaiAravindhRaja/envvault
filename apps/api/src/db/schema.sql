-- EnvVault Database Schema
-- Zero-knowledge: All secret values are encrypted client-side

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  avatar_url TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Organizations
CREATE TABLE IF NOT EXISTS organizations (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Organization members
CREATE TABLE IF NOT EXISTS org_members (
  id TEXT PRIMARY KEY,
  org_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member', -- admin, member, viewer
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(org_id, user_id)
);

-- Workspaces (projects)
CREATE TABLE IF NOT EXISTS workspaces (
  id TEXT PRIMARY KEY,
  org_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(org_id, slug)
);

-- Environments
CREATE TABLE IF NOT EXISTS environments (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  position INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(workspace_id, slug)
);

-- Secrets (all values encrypted client-side)
CREATE TABLE IF NOT EXISTS secrets (
  id TEXT PRIMARY KEY,
  environment_id TEXT NOT NULL REFERENCES environments(id) ON DELETE CASCADE,
  key_hash TEXT NOT NULL, -- SHA-256 hash for lookup
  key_encrypted TEXT NOT NULL, -- AES-256-GCM encrypted key
  value_encrypted TEXT NOT NULL, -- AES-256-GCM encrypted value
  nonce TEXT NOT NULL, -- Encryption nonce
  version INTEGER DEFAULT 1,
  comment TEXT, -- Optional comment (also encrypted)
  created_by TEXT REFERENCES users(id),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(environment_id, key_hash)
);

-- Secret versions (for history)
CREATE TABLE IF NOT EXISTS secret_versions (
  id TEXT PRIMARY KEY,
  secret_id TEXT NOT NULL REFERENCES secrets(id) ON DELETE CASCADE,
  version INTEGER NOT NULL,
  value_encrypted TEXT NOT NULL,
  nonce TEXT NOT NULL,
  created_by TEXT REFERENCES users(id),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Audit logs
CREATE TABLE IF NOT EXISTS audit_logs (
  id TEXT PRIMARY KEY,
  org_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id TEXT REFERENCES users(id),
  action TEXT NOT NULL, -- create, read, update, delete
  resource_type TEXT NOT NULL, -- secret, workspace, environment
  resource_id TEXT NOT NULL,
  metadata TEXT, -- JSON metadata
  ip_address TEXT,
  user_agent TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_secrets_env ON secrets(environment_id);
CREATE INDEX IF NOT EXISTS idx_secrets_hash ON secrets(key_hash);
CREATE INDEX IF NOT EXISTS idx_audit_org ON audit_logs(org_id);
CREATE INDEX IF NOT EXISTS idx_audit_user ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_created ON audit_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_workspaces_org ON workspaces(org_id);
CREATE INDEX IF NOT EXISTS idx_environments_workspace ON environments(workspace_id);
