import React, { useEffect, useState } from 'react'

export default function History() {
  const [runs, setRuns] = useState([])

  useEffect(() => {
    fetch('/api/runs').then(r => r.json()).then(d => setRuns(d.runs || [])).catch(() => {})
  }, [])

  if (!runs.length) {
    return (
      <div className="text-center py-16 text-hmi-muted">
        <div className="text-4xl mb-4">📋</div>
        <div>아직 실행 기록이 없습니다</div>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold mb-4">실행 이력</h2>
      {runs.map(run => (
        <div key={run.id} className="bg-hmi-surface border border-hmi-border rounded-xl px-5 py-4 flex items-center gap-4">
          <span className={`w-3 h-3 rounded-full ${run.status === 'completed' ? 'bg-hmi-green' : run.status === 'failed' ? 'bg-hmi-red' : 'bg-hmi-yellow'}`} />
          <div className="flex-1">
            <div className="font-medium">{run.input_file}</div>
            <div className="text-xs text-hmi-muted">{new Date(run.started_at).toLocaleString('ko-KR')}</div>
          </div>
          <div className="text-right">
            <div className="text-sm font-mono">{run.duration_sec?.toFixed(1)}s</div>
            {run.qa_score != null && <div className="text-xs text-hmi-muted">QA: {run.qa_score}%</div>}
          </div>
          <button className="text-xs text-hmi-accent hover:underline">상세</button>
        </div>
      ))}
    </div>
  )
}