# HMI Map Pipeline — Project Documentation
**Version:** 1.0.0 | **Date:** 2026-05-16 | **Status:** Production Ready

---

## Table of Contents

1. [Project Overview](#1-项目概述)
2. [System Architecture](#2-系统架构)
3. [Project Structure](#3-项目结构)
4. [Installation & Setup](#4-安装与设置)
5. [Pipeline Stages](#5-파이프라인-단계)
6. [Web UI Usage](#6-웹-ui-사용법)
7. [API Reference](#7-api-참조)
8. [QA & Testing](#8-qa-및-테스트)
9. [Troubleshooting](#9-문제해결)
10. [Review History](#10-검수-이력)

---

## 1. Project Overview

### Project Name
**HMI Map Pipeline** — AI-based HMI Map Automation Pipeline + Web UI Dashboard

### Purpose
CAD 도면(DXF/DWG)을 입력으로 하여 산업용 3D Isometric(ISO) HMI 배경 지도를 자동으로 생성하는 엔드 투 엔드 파이프라인과, 이를 웹에서 관리/실행/검수할 수 있는 대시보드를 제공합니다.

### Target Users
- Industrial automation engineers
- HMI designers working with CAD-derived floor plans
- Teams needing consistent, reproducible map generation

### System Requirements
- **OS:** Ubuntu Linux (XPS 15-9570)
- **RAM:** 8GB minimum
- **Runtime:** Node.js v22 + Python 3 + PM2

---

## 2. System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    HMI Map Pipeline                      │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  [Input]          [Pipeline]           [Output]         │
│  DXF/DWG ──┐   ┌──────────────────┐   ┌─────────────┐  │
│  PNG/PDF ──┼──→│ Preprocess       │──→│ Parsed Data │  │
│            │   │ Parse            │──→│ (Rooms/Walls│  │
│            │   │ Render           │──→│ ISO Image   │  │
│            │   │ QA               │──→│ QA Report   │  │
│            │   └──────────────────┘   └─────────────┘  │
│                                                          │
│  [Web UI]          [API Server]        [Database]       │
│  React ─────────→│ Express :4003 │←→ SQLite (hmimap.db)│
│  TailwindCSS     │ /api/run-step │                       │
│  Vite Dev        │ /api/run-full │                       │
│  Port 5175       │ /api/feedbacks│                       │
│                  └──────────────────────────────────────│
└─────────────────────────────────────────────────────────┘
```

### Components

| Component | Technology | Port | Description |
|-----------|-----------|------|-------------|
| Web UI | React 18 + Vite | 5175 | User dashboard (dev) |
| API Server | Express.js | 4003 | REST API + pipeline runner |
| Pipeline | Python 3 + ezdxf + PIL | — | Core CAD processing |
| Database | SQLite (better-sqlite3) | — | Runs, results, feedback storage |
| Process Manager | PM2 | — | Auto-restart, logs |
| Static Build | Vite build → dist/ | 4003 | Production static files |

---

## 3. Project Structure

```
/home/sykim/workspace/
├── hmimap-web/                 # Main project (Web UI + API + Pipeline)
│   ├── server/
│   │   ├── index.js           # Express API server (port 4003)
│   │   ├── run_step.py        # Python pipeline step runner
│   │   └── db/
│   │       ├── db.js          # SQLite wrapper
│   │       └── schema.sql     # DB schema (4 tables)
│   ├── src/
│   │   ├── App.jsx            # Tab navigation (홈/이력/설정)
│   │   ├── pages/
│   │   │   ├── Home.jsx       # 파일업로드 + 실행모드 + 실시간로그
│   │   │   ├── History.jsx    # 실행이력 타임라인
│   │   │   └── Settings.jsx   # AI/QA 파라미터 sliders
│   │   ├── components/
│   │   │   ├── StepIndicator.jsx  # 5단계 인디케이터
│   │   │   ├── FileUploader.jsx   # Drag & Drop
│   │   │   ├── StageRunner.jsx    # 실행 버튼들
│   │   │   ├── ResultPreview.jsx # 점수바 + 통과/재실행
│   │   │   └── FeedbackPanel.jsx # 👍/👎 + 코멘트
│   │   └── main.jsx
│   ├── dist/                   # Vite production build
│   ├── docs/                   # Review reports
│   ├── data/                   # SQLite DB (hmimap.db)
│   ├── package.json
│   ├── ecosystem.config.cjs    # PM2 config
│   └── vite.config.js
│
├── hmi-map-pipeline/           # Python pipeline source
│   └── src/
│       ├── parser/             # DXF parsing (dxf_parser.py)
│       ├── renderer/           # ISO rendering (iso_renderer.py)
│       └── pipeline/           # Pipeline orchestration
│
└── hmimap-db/                  # (legacy, not in use)
```

---

## 4. Installation & Setup

### 4.1 Prerequisites

```bash
# Check versions
node --version    # v22.x required
python3 --version # 3.x required
pip3 --version    # up to date

# Install Python dependencies
pip3 install ezdxf Pillow numpy

# Install Node dependencies
cd /home/sykim/workspace/hmimap-web
npm install
```

### 4.2 PM2 Setup

```bash
cd /home/sykim/workspace/hmimap-web

# Start with PM2
pm2 start ecosystem.config.cjs

# Save process list
pm2 save

# Startup script (optional)
pm2 startup
```

### 4.3 Running the Application

**Development Mode:**
```bash
cd /home/sykim/workspace/hmimap-web
npm start   # Runs: server (4003) + Vite dev (5175) concurrently
```

**Production Mode:**
```bash
pm2 start ecosystem.config.cjs
# Access: http://localhost:4003
```

### 4.4 URLs

| Environment | URL | Description |
|-------------|-----|-------------|
| Production | http://localhost:4003 | Built React + Express |
| Dev (Frontend) | http://localhost:5175 | Vite dev server |
| Dev (API) | http://localhost:4003/api/runs | REST API |

---

## 5. Pipeline Stages

The HMI Map pipeline consists of 5 sequential stages:

### Stage 1: Preprocess (전처리)
- **Input:** DXF/DWG file
- **Output:** `{ layers: string[], entity_count: int, scale: "mm" }`
- **Description:** Extract layer names and entity count from CAD file
- **API:** `POST /api/run-step` with `{"action": "preprocess", "file_path": "..."}`

### Stage 2: Parse (파싱)
- **Input:** DXF/DWG file
- **Output:** `{ walls: int, rooms: int, columns: int, openings: int, bounding_box: [x,y,w,h] }`
- **Description:** Parse walls, rooms, columns, doors/windows from CAD geometry
- **API:** `POST /api/run-step` with `{"action": "parse", "file_path": "..."}`

### Stage 3: Render (렌더링)
- **Input:** Parsed CAD data
- **Output:** `base_render.png` (ISO image)
- **Description:** Generate 3D isometric HMI map image from parsed data
- **API:** `POST /api/run-step` with `{"action": "render", "file_path": "..."}`

### Stage 4: QA (품질검사)
- **Input:** Rendered image + parsed data
- **Output:** `{ alignment: int, color: int, artifact: int, overall: int }`
- **Description:** Score alignment, color consistency, artifact removal
- **API:** `POST /api/run-step` with `{"action": "qa", "output_dir": "..."}`

### Stage 5: Feedback (피드백)
- **Input:** QA results + human review
- **Output:** Saved to SQLite `feedbacks` table
- **Description:** Thumbs up/down, issue type selection, comments
- **API:** `POST /api/feedbacks`

---

## 6. Web UI Usage

### 6.1 Home Tab (홈)
- **파일 업로드:** Drag & Drop 또는 클릭하여 DXF/DWG 파일 선택
- **실행 모드:**
  - **한번에 실행:** 5단계 전체를 한번에 자동 실행
  - **단계별 실행:** 각 단계를 개별적으로 실행/검수
  - **이어서 실행:** 완료된 단계부터 이어서 실행
- **실시간 로그:** 각 단계 실행 시 콘솔 로그 실시간 표시
- **결과 미리보기:** 단계 완료 후 JSON 결과 또는 이미지 미리보기

### 6.2 History Tab (이력)
- 타임라인 형태로 실행 이력 표시
- 상태별 색상: 성공(초록), 실패(빨강), 진행중(노랑)
- 클릭하여 상세 결과 확인 가능

### 6.3 Settings Tab (설정)
- **AI 파라미터:** Temperature, Max Tokens 등 조절
- **QA 파라미터:** alignment_threshold, color_tolerance 등 조절
- 슬라이더로 값을 조정하고 자동 저장

---

## 7. API Reference

### Base URL
`http://localhost:4003`

### Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/runs` | 모든 실행 기록 조회 |
| `POST` | `/api/run-step` | 단일 단계 실행 |
| `POST` | `/api/run-full` | 전체 파이프라인 실행 |
| `POST` | `/api/feedbacks` | 피드백 저장 |
| `GET` | `/api/configs` | 설정 조회 |
| `POST` | `/api/configs` | 설정 저장 |

### `POST /api/run-step`

**Request:**
```json
{
  "action": "parse",
  "file_path": "/tmp/hmimap-upload/sample.dxf"
}
```

**Response:**
```json
{
  "message": "Parse done",
  "walls": 5,
  "rooms": 1,
  "columns": 1,
  "openings": 0,
  "bounding_box": [0, 0, 10000, 8000]
}
```

### `POST /api/feedbacks`

**Request:**
```json
{
  "run_id": 1,
  "step": "render",
  "rating": "thumbs_down",
  "issue_type": "alignment",
  "comment": "벽 위치가 약간偏移되었습니다."
}
```

---

## 8. QA & Testing

### Test Results Summary

| Test | Status | Notes |
|------|--------|-------|
| API GET `/api/runs` | ✅ PASS | Returns runs array |
| API POST `/api/run-step` (preprocess) | ✅ PASS | Returns layers + entity_count |
| API POST `/api/run-step` (parse) | ✅ PASS | Returns walls, rooms, columns |
| API POST `/api/run-step` (render) | ✅ PASS | base_render.png saved |
| API POST `/api/run-step` (qa) | ✅ PASS | Returns scores |
| Frontend build | ✅ PASS | 161KB JS, 10KB CSS |
| Static serving | ✅ PASS | HTML served correctly |
| PM2 startup | ✅ PASS | Process running stable |

### Test Commands

```bash
# Run API tests
curl http://localhost:4003/api/runs
curl -X POST http://localhost:4003/api/run-step \
  -H "Content-Type: application/json" \
  -d '{"action":"preprocess","file_path":"/tmp/sample.dxf"}'

# Run frontend build
cd /home/sykim/workspace/hmimap-web && npm run build

# Check PM2 status
pm2 list
pm2 logs hmimap-web
```

---

## 9. Troubleshooting

### Issue: `curl: (7) Failed to connect`
**Solution:** PM2 not running. Start with `pm2 start ecosystem.config.cjs`

### Issue: `npm install` fails on better-sqlite3
**Solution:** Install build tools: `sudo apt install build-essential python3-dev`, then retry

### Issue: Python import errors (ezdxf, PIL)
**Solution:** `pip3 install ezdxf Pillow numpy --upgrade`

### Issue: Vite build fails
**Solution:** Delete `node_modules` and `package-lock.json`, then `npm install`

---

## 10. Review History

All review reports are located in `docs/`:

| File | Date | Task | Status |
|------|------|------|--------|
| `TASK_W1_REVIEW.md` | 2026-05-16 01:07 | Web UI Phase 1 — API + DB + Pages | ✅ COMPLETE |
| `TASK_W2_REVIEW.md` | 2026-05-16 01:10 | Step Execution UI — StageRunner + ResultPreview | ✅ COMPLETE |
| `FINAL_REVIEW.md` | 2026-05-16 01:18 | W7 final review — architecture summary | ✅ COMPLETE |

---

## GitHub Repository

```
https://github.com/cloud-honey/hmimap-web
```

**Commits:**
- `65a1a02` — HMI Map Web UI Phase 1 complete
- `1012e1b` — W2 step execution UI
- `06cff5f` — W3-W5 ResultPreview, History timeline
- `a120b22` — W6 FeedbackPanel
- `59ff22d` — W7 final review + architecture summary

---

*Generated: 2026-05-16 10:59 KST*
*Author: Booms (붐스) — XPS Agent*