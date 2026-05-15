import React from 'react'

export default function ResultPreview({ step, result, onPass, onRetry }) {
  const stepLabels = ['전처리', '파싱', '렌더링', 'AI 리파인', 'QA']

  return (
    <div className="bg-hmi-surface border border-hmi-border rounded-xl p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">✅</span>
          <div>
            <div className="font-semibold">{stepLabels[step]} 완료</div>
            <div className="text-xs text-hmi-muted">
              {result?.message || 'Step completed successfully'}
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onRetry}
            className="px-4 py-2 rounded-lg text-sm border border-hmi-border text-hmi-muted hover:text-hmi-yellow hover:border-hmi-yellow transition-colors"
          >
            ↻ 재실행
          </button>
          <button
            onClick={onPass}
            className="px-5 py-2 rounded-lg text-sm bg-hmi-green text-white font-medium hover:bg-hmi-green/80 transition-colors"
          >
            ✅ 통과 — 다음 단계
          </button>
        </div>
      </div>

      {/* Result details */}
      {result && (
        <div className="grid grid-cols-2 gap-3">
          {Object.entries(result).filter(([k]) => !['message','output'].includes(k)).map(([k, v]) => (
            <div key={k} className="bg-hmi-bg border border-hmi-border rounded-lg px-3 py-2">
              <div className="text-xs text-hmi-muted capitalize">{k}</div>
              <div className="text-sm font-mono mt-0.5">{String(v)}</div>
            </div>
          ))}
        </div>
      )}

      {/* Image preview if available */}
      {result?.preview && (
        <div className="mt-3">
          <img src={result.preview} alt="Step preview" className="max-h-64 rounded-lg border border-hmi-border" />
        </div>
      )}
    </div>
  )
}