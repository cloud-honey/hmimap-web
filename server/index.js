import express from 'express'
import cors from 'cors'
import { spawn } from 'child_process'
import multer from 'multer'
import { mkdirSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import { getDb, queries } from './db/db.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const WEB_ROOT = resolve(__dirname)
const PACKAGE_ROOT = resolve(__dirname, '..')
const PIPELINE_ROOT = resolve(PACKAGE_ROOT, 'pipeline')
const DIST = resolve(WEB_ROOT, 'dist')
const PORT = process.env.PORT || 4003

const app = express()
app.use(cors())
app.use(express.json())

// File uploads
const UPLOAD_DIR = '/tmp/hmimap-upload'
mkdirSync(UPLOAD_DIR, { recursive: true })
const upload = multer({ dest: UPLOAD_DIR })

// ─── GET /api/runs ───────────────────────────────────────────
app.get('/api/runs', (req, res) => {
  try {
    const db = getDb()
    res.json({ runs: queries.getRuns(db) })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

// ─── POST /api/run-step ──────────────────────────────────────
app.post('/api/run-step', upload.single('file'), async (req, res) => {
  const { step, config } = req.body
  const file = req.file
  if (!file) return res.status(400).json({ error: 'No file uploaded' })

  const db = getDb()
  let run = db.prepare(`SELECT * FROM runs WHERE status='running' ORDER BY id DESC LIMIT 1`).get()
  if (!run) {
    const info = queries.insertRun(db, { input_file: file.originalname, input_path: file.path, mode: 'step', config: config || '{}' })
    run = { id: info.lastInsertRowid }
  }

  const stepMap = { preprocess: 0, parse: 1, render: 2, ai_refine: 3, qa: 4 }
  const stepIdx = stepMap[step] ?? 0

  try {
    const out = await runPython([THIS_DIR + '/run_step.py', step, file.path])
    let result
    try { result = JSON.parse(out) }
    catch { result = { message: out, raw: true } }

    queries.insertStepResult(db, { run_id: run.id, step: stepIdx, step_name: step, output_path: file.path, log: JSON.stringify(result) })
    res.json(result)
  } catch (err) {
    queries.insertStepResult(db, { run_id: run.id, step: stepIdx, step_name: step, output_path: file.path, log: err.message })
    res.status(500).json({ error: err.message })
  }
})

// ─── POST /api/run-full ─────────────────────────────────────
app.post('/api/run-full', upload.single('file'), async (req, res) => {
  const file = req.file
  if (!file) return res.status(400).json({ error: 'No file' })

  const db = getDb()
  const info = queries.insertRun(db, { input_file: file.originalname, input_path: file.path, mode: 'full', config: '{}' })
  const runId = String(info.lastInsertRowid)
  const outputDir = `/tmp/hmimap-output-${runId}`
  mkdirSync(outputDir, { recursive: true })

  const cfgPath = `/tmp/hmimap-cfg-${runId}.json`
  const { writeFileSync } = await import('fs')
  writeFileSync(cfgPath, JSON.stringify({
    input: { path: file.path },
    output: { directory: outputDir },
    ai_refinement: { enabled: false },
    pipeline: { skip_ai_refinement: true, verbose: true },
  }, null, 2))

  try {
    const out = await runPython([PIPELINE_ROOT + '/src/pipeline/main_pipeline.py', '--config', cfgPath])
    queries.updateRunStatus(db, runId, 'completed', null, new Date().toISOString())
    res.json({ run_id: runId, results: out })
  } catch (err) {
    queries.updateRunStatus(db, runId, 'failed', null, new Date().toISOString())
    res.status(500).json({ error: err.message })
  }
})

// ─── POST /api/feedbacks ─────────────────────────────────────
app.post('/api/feedbacks', (req, res) => {
  try {
    const db = getDb()
    const { run_id, step, rating, issue_type, comment } = req.body
    queries.insertFeedback(db, { run_id, step, rating, issue_type, comment })
    res.json({ ok: true })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

// ─── GET /api/configs ────────────────────────────────────────
app.get('/api/configs', (req, res) => {
  try {
    const db = getDb()
    res.json({ configs: queries.listConfigs(db) })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

// ─── POST /api/configs ───────────────────────────────────────
app.post('/api/configs', (req, res) => {
  try {
    const db = getDb()
    const { name, config } = req.body
    queries.upsertConfig(db, name, config)
    res.json({ ok: true })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

// ─── Log stream (SSE) ───────────────────────────────────────
app.get('/api/log-stream/:runId', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache')
  res.flushHeaders()
  res.write('data: ready\n\n')
  req.on('close', () => res.end())
})

// ─── Static: serve Vite dist ──────────────────────────────────
const DIST = resolve(THIS_DIR, '../dist')
app.use(express.static(DIST))

// ─── Helper: run python3 ──────────────────────────────────────
function runPython(args) {
  return new Promise((resolve, reject) => {
    const proc = spawn('python3', args, { cwd: PIPELINE_ROOT })
    let stdout = '', stderr = ''
    proc.stdout.on('data', d => stdout += d)
    proc.stderr.on('data', d => stderr += d)
    proc.on('close', code => {
      if (code !== 0) reject(new Error(stderr || `exit ${code}`))
      else resolve(stdout.trim())
    })
    proc.on('error', reject)
  })
}

app.listen(PORT, () => {
  console.log(`HMI Map Web API running on http://localhost:${PORT}`)
})