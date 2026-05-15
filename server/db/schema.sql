-- HMI Map Pipeline Web Dashboard SQLite Schema

CREATE TABLE IF NOT EXISTS runs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  input_file TEXT NOT NULL,
  input_path TEXT,
  mode TEXT DEFAULT 'step',
  config TEXT,
  current_step INTEGER DEFAULT 0,
  status TEXT DEFAULT 'created',
  qa_score REAL,
  started_at TEXT DEFAULT (datetime('now')),
  finished_at TEXT
);

CREATE TABLE IF NOT EXISTS step_results (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  run_id INTEGER NOT NULL,
  step INTEGER NOT NULL,
  step_name TEXT NOT NULL,
  output_path TEXT,
  log TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (run_id) REFERENCES runs(id)
);

CREATE TABLE IF NOT EXISTS feedbacks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  run_id INTEGER NOT NULL,
  step INTEGER,
  rating TEXT,
  issue_type TEXT,
  comment TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (run_id) REFERENCES runs(id)
);

CREATE TABLE IF NOT EXISTS configs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT UNIQUE NOT NULL,
  config_json TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now'))
);