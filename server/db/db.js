import Database from 'better-sqlite3'
import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const DB_PATH = resolve(__dirname, '../../data/hmimap.db')

// Ensure data dir exists
import { mkdirSync } from 'fs'
mkdirSync(resolve(__dirname, '../../data'), { recursive: true })

let _db = null

export function getDb() {
  if (!_db) {
    _db = new Database(DB_PATH)
    _db.pragma('journal_mode = WAL')
    _db.pragma('foreign_keys = ON')

    // Init schema
    const schema = readFileSync(resolve(__dirname, 'schema.sql'), 'utf8')
    _db.exec(schema)
  }
  return _db
}

// Helper queries
export const queries = {
  insertRun: (db, { input_file, input_path, mode, config }) =>
    db.prepare(`INSERT INTO runs (input_file, input_path, mode, config) VALUES (?,?,?,?)`)
      .run(input_file, input_path, mode, config),

  getRuns: (db) =>
    db.prepare(`SELECT * FROM runs ORDER BY started_at DESC LIMIT 50`).all(),

  getRun: (db, id) =>
    db.prepare(`SELECT * FROM runs WHERE id = ?`).get(id),

  updateRunStatus: (db, id, status, qa_score, finished_at) =>
    db.prepare(`UPDATE runs SET status=?, qa_score=?, finished_at=? WHERE id=?`)
      .run(status, qa_score, finished_at, id),

  insertStepResult: (db, { run_id, step, step_name, output_path, log }) =>
    db.prepare(`INSERT INTO step_results (run_id, step, step_name, output_path, log) VALUES (?,?,?,?,?)`)
      .run(run_id, step, step_name, output_path, log),

  getStepResults: (db, run_id) =>
    db.prepare(`SELECT * FROM step_results WHERE run_id=? ORDER BY step`).all(run_id),

  insertFeedback: (db, { run_id, step, rating, issue_type, comment }) =>
    db.prepare(`INSERT INTO feedbacks (run_id, step, rating, issue_type, comment) VALUES (?,?,?,?,?)`)
      .run(run_id, step, rating, issue_type, comment),

  getFeedbacks: (db, run_id) =>
    db.prepare(`SELECT * FROM feedbacks WHERE run_id=? ORDER BY created_at DESC`).all(run_id),

  upsertConfig: (db, name, config_json) =>
    db.prepare(`INSERT INTO configs (name, config_json) VALUES (?,?)`).run(name, config_json),

  getConfig: (db, name) =>
    db.prepare(`SELECT * FROM configs WHERE name=?`).get(name),

  listConfigs: (db) =>
    db.prepare(`SELECT id, name, created_at FROM configs ORDER BY created_at DESC`).all(),
}