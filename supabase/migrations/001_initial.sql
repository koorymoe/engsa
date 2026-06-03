-- Al-Amani Quality Management System
-- Initial Database Schema

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'designer', 'engineer', 'inspector')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Standards table (معايير الجودة)
CREATE TABLE IF NOT EXISTS standards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  main_title TEXT NOT NULL,
  sub_title TEXT NOT NULL,
  details TEXT NOT NULL,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Materials table (المواد)
CREATE TABLE IF NOT EXISTS materials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  specifications TEXT NOT NULL,
  manufacturer TEXT NOT NULL,
  quality_grade TEXT NOT NULL,
  standard_id UUID REFERENCES standards(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Projects table (المشاريع)
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  designer_id UUID REFERENCES users(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'planning' CHECK (status IN ('planning', 'in_progress', 'completed', 'on_hold')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Project Standards (ربط المشاريع بالمعايير)
CREATE TABLE IF NOT EXISTS project_standards (
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  standard_id UUID REFERENCES standards(id) ON DELETE CASCADE,
  PRIMARY KEY (project_id, standard_id)
);

-- Project Materials (ربط المشاريع بالمواد)
CREATE TABLE IF NOT EXISTS project_materials (
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  material_id UUID REFERENCES materials(id) ON DELETE CASCADE,
  quantity DECIMAL(10,2) NOT NULL DEFAULT 0,
  unit TEXT NOT NULL DEFAULT 'وحدة',
  PRIMARY KEY (project_id, material_id)
);

-- Execution Reports (تقارير التنفيذ)
CREATE TABLE IF NOT EXISTS execution_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  engineer_id UUID REFERENCES users(id) ON DELETE SET NULL,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'paused')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Quality Reports (تقارير الجودة)
CREATE TABLE IF NOT EXISTS quality_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  inspector_id UUID REFERENCES users(id) ON DELETE SET NULL,
  checklist JSONB NOT NULL DEFAULT '[]',
  overall_status TEXT NOT NULL DEFAULT 'pending' CHECK (overall_status IN ('pending', 'passed', 'failed', 'needs_revision')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI Conversations (محادثات الذكاء الاصطناعي)
CREATE TABLE IF NOT EXISTS ai_conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  messages JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_standards_created_by ON standards(created_by);
CREATE INDEX IF NOT EXISTS idx_materials_standard_id ON materials(standard_id);
CREATE INDEX IF NOT EXISTS idx_projects_designer_id ON projects(designer_id);
CREATE INDEX IF NOT EXISTS idx_execution_reports_project_id ON execution_reports(project_id);
CREATE INDEX IF NOT EXISTS idx_quality_reports_project_id ON quality_reports(project_id);
CREATE INDEX IF NOT EXISTS idx_ai_conversations_user_id ON ai_conversations(user_id);

-- Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE standards ENABLE ROW LEVEL SECURITY;
ALTER TABLE materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_standards ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE execution_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE quality_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_conversations ENABLE ROW LEVEL SECURITY;

-- Policies (allow all authenticated users to read)
CREATE POLICY "Allow authenticated read" ON users FOR SELECT USING (true);
CREATE POLICY "Allow authenticated read" ON standards FOR SELECT USING (true);
CREATE POLICY "Allow authenticated read" ON materials FOR SELECT USING (true);
CREATE POLICY "Allow authenticated read" ON projects FOR SELECT USING (true);
CREATE POLICY "Allow authenticated read" ON project_standards FOR SELECT USING (true);
CREATE POLICY "Allow authenticated read" ON project_materials FOR SELECT USING (true);
CREATE POLICY "Allow authenticated read" ON execution_reports FOR SELECT USING (true);
CREATE POLICY "Allow authenticated read" ON quality_reports FOR SELECT USING (true);
CREATE POLICY "Allow all" ON ai_conversations FOR ALL USING (true);

-- Allow insert/update/delete
CREATE POLICY "Allow authenticated write" ON users FOR ALL USING (true);
CREATE POLICY "Allow authenticated write" ON standards FOR ALL USING (true);
CREATE POLICY "Allow authenticated write" ON materials FOR ALL USING (true);
CREATE POLICY "Allow authenticated write" ON projects FOR ALL USING (true);
CREATE POLICY "Allow authenticated write" ON project_standards FOR ALL USING (true);
CREATE POLICY "Allow authenticated write" ON project_materials FOR ALL USING (true);
CREATE POLICY "Allow authenticated write" ON execution_reports FOR ALL USING (true);
CREATE POLICY "Allow authenticated write" ON quality_reports FOR ALL USING (true);

-- Sample data for testing
INSERT INTO users (email, name, role) VALUES
  ('admin@alamani.sa', 'أحمد العامر', 'admin'),
  ('designer@alamani.sa', 'سارة المهندس', 'designer'),
  ('engineer@alamani.sa', 'محمد التنفيذي', 'engineer'),
  ('inspector@alamani.sa', 'فاطمة المفتش', 'inspector')
ON CONFLICT (email) DO NOTHING;
