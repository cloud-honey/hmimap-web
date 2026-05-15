# Task W7-W8 Review — Web UI 최종 완료

Date: 2026-05-16 01:18 KST
Status: **COMPLETE** ✅

## 최종 산출물

```
hmimap-web/
├── server/
│   ├── index.js          # Express API (port 4003)
│   ├── run_step.py       # Python pipeline step runner
│   ├── db/
│   │   ├── db.js         # SQLite wrapper (better-sqlite3)
│   │   └── schema.sql    # 4 tables: runs, step_results, feedbacks, configs
├── src/
│   ├── App.jsx           # Tab nav (홈/이력/설정)
│   ├── pages/
│   │   ├── Home.jsx      # 파일업로드 + 3가지 실행모드 + 실시간로그
│   │   ├── History.jsx   # 실행이력 타임라인 (상태색상)
│   │   └── Settings.jsx   # AI/QA 파라미터 sliders
│   └── components/
│       ├── StepIndicator.jsx   # 5단계 인디케이터 (클릭 가능)
│       ├── FileUploader.jsx   # Drag & Drop
│       ├── StageRunner.jsx    # 실행버튼들 (mode별)
│       ├── ResultPreview.jsx   # 점수바 + 통과/재실행
│       └── FeedbackPanel.jsx   # 👍/👎 + 코멘트
├── dist/                 # Vite 빌드 (161KB JS)
└── ecosystem.config.cjs   # PM2 설정
```

## API Endpoints (4003)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/runs` | 실행 기록 목록 |
| POST | `/api/run-step` | 단계별 실행 |
| POST | `/api/run-full` | 한번에 전체 실행 |
| POST | `/api/feedbacks` | 피드백 제출 |
| GET | `/api/configs` | 설정 목록 |
| POST | `/api/configs` | 설정 저장 |

## 파이프라인 연동 확인

```
✅ preprocess → {layers, entity_count, scale}
✅ parse → {walls, rooms, columns, openings, bounding_box}
✅ render → base_render.png saved to /tmp/hmimap-render/
✅ qa → {alignment, color, artifact, overall}
```

## GitHub

```
https://github.com/cloud-honey/hmimap-web
Commits: W1-W7 (7개)
```

## PM2 실행

```bash
cd /home/sykim/workspace/hmimap-web
pm2 start ecosystem.config.cjs
pm2 save
```

## 접속

- **Static:** `http://localhost:4003/` (빌드된 React)
- **API:** `http://localhost:4003/api/runs`

## 다음 단계 (실사용 준비)

1. Vite dev server (5175)로 개발 모드 테스트
2. 실제 CAD 파일로 End-to-End 테스트 (8GB PC)
3. 이미지 미리보기 (render 결과 PNG → 웹에 표시)
4. SSE 로그 스트림 구현 (실시간 진행률)