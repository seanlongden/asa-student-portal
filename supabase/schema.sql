-- ASA Student Portal - Supabase Schema
-- Run this in your Supabase SQL Editor to set up the database

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Students
CREATE TABLE students (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT,
  email TEXT UNIQUE NOT NULL,
  company TEXT,
  email_tool TEXT,
  api_key TEXT,
  stripe_customer_id TEXT,
  status TEXT DEFAULT 'Active',
  join_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Leads (from cold email outreach)
CREATE TABLE leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  lead_name TEXT,
  company TEXT,
  stage TEXT,
  positive_reply_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Clients (closed deals)
CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  client_name TEXT,
  monthly_value NUMERIC,
  status TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Payments
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  amount NUMERIC,
  type TEXT,
  date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Weekly email campaign metrics
CREATE TABLE weekly_email_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  week_starting DATE NOT NULL,
  emails_sent INTEGER DEFAULT 0,
  replies INTEGER DEFAULT 0,
  positive_replies INTEGER DEFAULT 0,
  open_rate NUMERIC DEFAULT 0,
  bounce_rate NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id, week_starting)
);

-- Training module progress
CREATE TABLE progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  module_id TEXT NOT NULL,
  module_order INTEGER,
  status TEXT DEFAULT 'In Progress',
  completed_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id, module_id)
);

-- Student saved work / inputs per module
CREATE TABLE student_inputs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  module_id TEXT NOT NULL,
  module_order INTEGER,
  input_key TEXT NOT NULL,
  value TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id, module_id, input_key)
);

-- Indexes
CREATE INDEX idx_students_email ON students(email);
CREATE INDEX idx_students_stripe_id ON students(stripe_customer_id);
CREATE INDEX idx_leads_student ON leads(student_id);
CREATE INDEX idx_clients_student ON clients(student_id);
CREATE INDEX idx_metrics_student ON weekly_email_metrics(student_id);
CREATE INDEX idx_progress_student ON progress(student_id);
CREATE INDEX idx_inputs_student ON student_inputs(student_id);
CREATE INDEX idx_inputs_student_module ON student_inputs(student_id, module_id);
