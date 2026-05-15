import React, { useState } from 'react'
import { Link } from 'react-router-dom'

export default function History() {
  const [runs, setRuns] = useState([])
  const [loading, setLoading] = useState(false)
  const [selectedRun, setSelectedRun] = useState(null)

  const loadRuns = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/runs')
      const data = await res.json()
      setRuns(data.runs || [])
    } catch (e) {
      console.error('Failed to load runs:', e)
    } finally {
      setLoading(false)
    }
  }

  React.useEffect(() => { loadRuns() }, [])

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-hmi-green'
      case 'failed': return 'bg-hmi-red'
      default: return 'bg-hmi-yellow'
    }
  }

  return (
    <div className="space-y-4 max-w-4xl">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">📋 실행 이력</h2>
        <button onClick={loadRuns} className="text-xs text-hmi-muted hover:text-hmi-accent px-3 py-1 border border-hmi-border rounded-lg">
          🔄 새로고침
        </button>
      </div>

      {!runs.length && !loading ? (
        <div className="text-center py-16 text-hmi-muted bg-hmi-surface border border-hmi-border rounded-xl">
          <div className="text-4xl mb-4">📋</div>
          <div>아직 실행 기록이 없습니다</div>
          <div className="text-xs mt-2">파일을 업로드하고 실행해 보세요</div>
        </div>
      ) : (
        <div className="space-y-2">
          {runs.map(run => (
            <div
              key={run.id}
              className="bg-hmi-surface border border-hmi-border rounded-xl px-5 py-4 flex items-center gap-4 hover:border-hmi-accent/50 transition-colors cursor-pointer"
              onClick={() => setSelectedRun(run.id === selectedRun ? null : run.id)}
            >
              <span className={`w-3 h-3 rounded-full flex-shrink-0 ${getStatusColor(run.status)}`} />
              <div className="flex-1 min-w-0">
                <div className="font-medium truncate">{run.input_file}</div>
                <div className="text-xs text-hmi-muted">
                  {new Date(run.started_at).toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' })}
                  {run.mode && <span className="ml-2">• {run.mode}</span>}
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                {run.duration_sec != null ? (
                  <div className="text-sm font-mono">{run.duration_sec.toFixed(1)}s</div>
                ) : <div className="text-sm text-hmi-muted">—</div>}
                {run.qa_score != null && (
                  <div className={`text-xs font-mono ${
                    run.qa_score >= 80 ? 'text-hmi-green' : run.qa_score >= 60 ? 'text-hmi-yellow' : 'text-hmi-red'
                  }`}>
                    QA: {run.qa_score}%
                  </div>
                )}
              </div>
              <span className="text-hmi-muted">{selectedRun === run.id ? '▲' : '▼'}</span>
            </div>
          ))}
        </div>
      )}

      {loading && (
        <div className="text-center py-8 text-hmi-muted">
          <span className="animate-pulse">🔄 로딩 중...</span>
        </div>
      )}
    </div>
  )
}