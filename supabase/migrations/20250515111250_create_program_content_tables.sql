-- Programs Table
CREATE TABLE programs (
  id SERIAL PRIMARY KEY,
  slug VARCHAR(100) UNIQUE NOT NULL, -- e.g., 'weight-loss', 'hair-loss'
  name VARCHAR(200) NOT NULL,
  description TEXT,
  category VARCHAR(100), -- e.g., 'medications', 'wellness', 'conditions'
  duration_weeks INTEGER,
  difficulty_level VARCHAR(50), -- 'beginner', 'intermediate', 'advanced'
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Program Content Weeks/Stages
CREATE TABLE program_stages (
  id SERIAL PRIMARY KEY,
  program_id INTEGER REFERENCES programs(id),
  stage_number INTEGER, -- Week 1, Week 2, etc.
  title VARCHAR(200),
  description TEXT,
  unlock_condition TEXT, -- JSON: {"type": "time_based", "weeks": 1} or {"type": "task_completion", "task_ids": [1,2]}
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Program Content Items
CREATE TABLE program_content (
  id SERIAL PRIMARY KEY,
  program_id INTEGER REFERENCES programs(id),
  stage_id INTEGER REFERENCES program_stages(id),
  content_type VARCHAR(100), -- 'article', 'video', 'interactive', 'checklist', 'assessment'
  subtype VARCHAR(100), -- 'recommended', 'week_focus', 'quick_help', 'coming_up'
  title VARCHAR(200) NOT NULL,
  description TEXT,
  content_html TEXT,
  content_metadata JSONB, -- Additional structured data
  reading_time_minutes INTEGER,
  priority INTEGER DEFAULT 0, -- For ordering within a stage
  tags TEXT[], -- For filtering/searching
  is_featured BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- User Program Progress
CREATE TABLE user_program_progress (
  id SERIAL PRIMARY KEY,
  user_id INTEGER,
  program_id INTEGER REFERENCES programs(id),
  current_stage_id INTEGER REFERENCES program_stages(id),
  completed_content_ids INTEGER[],
  start_date DATE,
  last_access_date DATE,
  completion_percentage DECIMAL(5,2),
  custom_data JSONB, -- Store user-specific progress data
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Content Personalization Rules
CREATE TABLE content_personalization_rules (
  id SERIAL PRIMARY KEY,
  program_id INTEGER REFERENCES programs(id),
  rule_name VARCHAR(200),
  conditions JSONB, -- {"user_attributes": {"age": ">40"}, "progress": {"stage": ">=2"}}
  content_adjustments JSONB, -- What content to show/hide/modify
  is_active BOOLEAN DEFAULT true,
  priority INTEGER DEFAULT 0
);
