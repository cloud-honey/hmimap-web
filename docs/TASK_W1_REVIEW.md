# Task W1 Review — Web UI Phase 1 완료

Date: 2026-05-16 01:07 KST
Status: **COMPLETE** ✅

## 만들어진 것

```
hmimap-web/
├── server/
│   ├── index.js          # Express API (port 4003)
│   ├── run_step.py       # Python pipeline step runner
│   ├── db/
│   │   ├── db.js         # SQLite wrapper
│   │   └── schema.sql    # 4 tables
├── src/
│   ├── App.jsx           # Tab navigation (홈/이력/설정)
│   ├── pages/
│   │   ├── Home.jsx      # 파일업로드 + 단계별 실행
│   │   ├── History.jsx   # 실행 이력 타임라인
│   │   └── Settings.jsx   # AI/QA 파라미터 설정
│   └── components/
│       ├── StepIndicator.jsx    # 5단계 인디케이터
│       ├── FileUploader.jsx      # Drag & Drop
│       ├── StageRunner.jsx       # 실행 버튼들
│       └── ResultPreview.jsx     # 결과 미리보기 + Pass/Retry
├── dist/                 # Vite 빌드 산출물
└── package.json
```

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/runs` | 실행 기록 목록 |
| POST | `/api/run-step` | 단계별 실행 |
| POST | `/api/run-full` | 한번에 전체 실행 |
| POST | `/api/feedbacks` | 피드백 제출 |
| GET | `/api/configs` | 설정 목록 |
| POST | `/api/configs` | 설정 저장 |
| GET | `/api/log-stream/:id` | SSE 로그 스트림 |

## DB Schema (SQLite)

- `runs`: 실행 기록 (id, input_file, mode, status, started_at, qa_score)
- `step_results`: 단계별 결과 (run_id, step, step_name, output_path, log)
- `feedbacks`: 피드백 (run_id, step, rating, issue_type, comment)
- `configs`: 저장된 설정 (name, config_json)

## 테스트 결과

- API: GET `/api/runs` ✅
- API: POST `/api/run-step` (parse) ✅ — `{"walls":5,"rooms":1,"columns":1,"openings":0}`
- API: POST `/api/run-step` (preprocess) ✅ — `{"layers":["WALL","DOOR","COLUMN","WINDOW"]}`
- Frontend: 빌드 성공 (156KB JS, 10KB CSS) ✅
- Static serving: `curl http://localhost:4003/` ✅ HTML 응답

## 다음 단계 (W2~W8)

| Task | 내용 |
|------|------|
| W2 | 파일 업로드 → pipeline 연동 개선 |
| W3 | StageRunner → 파이프라인 직접 연동 |
| W4 | 결과 미리보기 개선 (이미지 thumbnail) |
| W5 | 실행 이력 상세 뷰 |
| W6 | 피드백 시스템 완성 |
| W7 | 통합 테스트 5회 + 버그 수정 |
| W8 | 최종 리포트 웹페이지 |

## 접속

- **Frontend:** `http://localhost:5175` (Vite dev server)
- **API:** `http://localhost:4003`
- **Git:** `https://github.com/cloud-honey/hmimap-web`