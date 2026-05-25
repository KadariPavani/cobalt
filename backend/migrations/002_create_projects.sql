-- Up
DO $$ BEGIN
  CREATE TYPE project_status AS ENUM ('active', 'archived');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE priority_level AS ENUM ('low', 'medium', 'high');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS projects (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        VARCHAR(180) NOT NULL,
  description TEXT,
  status      project_status NOT NULL DEFAULT 'active',
  priority    priority_level NOT NULL DEFAULT 'medium',
  deadline    DATE,
  created_by  UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_projects_created_by ON projects(created_by);
CREATE INDEX IF NOT EXISTS idx_projects_status     ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_priority   ON projects(priority);
CREATE INDEX IF NOT EXISTS idx_projects_deadline   ON projects(deadline);
CREATE INDEX IF NOT EXISTS idx_projects_name_trgm  ON projects USING gin (to_tsvector('simple', name));

DROP TRIGGER IF EXISTS trg_projects_updated_at ON projects;
CREATE TRIGGER trg_projects_updated_at
BEFORE UPDATE ON projects
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Down
DROP TRIGGER IF EXISTS trg_projects_updated_at ON projects;
DROP TABLE IF EXISTS projects CASCADE;
DROP TYPE IF EXISTS project_status;
DROP TYPE IF EXISTS priority_level;
