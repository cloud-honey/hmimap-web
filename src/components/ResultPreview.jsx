import React, { useState } from 'react'

const STEP_LABELS = ['전처리', '파싱', '렌더링', 'AI 리파인', 'QA']

export default function ResultPreview({ step, result, steps, onPass, onRetry }) {
  const stepLabel = STEP_LABELS[step] || `Step ${step + 1}`
  const hasImage = result?.preview && /\.(png|jpg|jpeg)$/i.test(result.preview)

  const scoreColors = {
    alignment: result?.alignment,
    color: result?.color,
    artifact: result?.artifact,
    overall: result?.overall,
  }

  const getScoreColor = (val) => {
    if (val === undefined || val === null) return 'text-hmi-muted'
    if (val >= 80) return 'text-hmi-green'
    if (val >= 60) return 'text-hmi-yellow'
    return 'text-hmi-red'
  }

  return (
    <div className="bg-hmi-surface border border-hmi-border rounded-xl p-5 space-y-4">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{step < 2 ? '🔍' : step < 4 ? '🎨' : '📊'}</span>
          <div>
            <div className="font-semibold">{stepLabel} 결과</div>
            <div className="text-xs text-hmi-muted">{result?.message || 'Completed'}</div>
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

      {/* Image preview */}
      {hasImage && (
        <div className="rounded-lg border border-hmi-border overflow-hidden">
          <img src={result.preview} alt="Step preview" className="max-h-72 w-full object-contain bg-hmi-bg" />
        </div>
      )}

      {/* Score bars */}
      {result?.overall !== undefined && (
        <div className="grid grid-cols-4 gap-3">
          {['alignment', 'color', 'artifact', 'overall'].map(key => {
            const val = scoreColors[key]
            return (
              <div key={key} className="bg-hmi-bg border border-hmi-border rounded-lg p-3 text-center">
                <div className="text-xs text-hmi-muted capitalize">{key}</div>
                <div className={`text-xl font-bold mt-1 ${getScoreColor(typeof val === 'number' ? val : undefined)}`}>
                  {typeof val === 'number' ? `${val}%` : '—'}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Key-value details */}
      {result && (
        <div className="grid grid-cols-2 gap-2">
          {Object.entries(result)
            .filter(([k]) => !['message', 'preview', 'raw'].includes(k))
            .map(([k, v]) => (
              <div key={k} className="bg-hmi-bg border border-hmi-border rounded-lg px-3 py-2 flex justify-between">
                <span className="text-xs text-hmi-muted capitalize">{k}</span>
                <span className="text-sm font-mono font-medium">{String(v)}</span>
              </div>
            ))}
        </div>
      )}

      {/* QA fallback notice */}
      {step === 4 && result?.overall < 75 && (
        <div className="bg-hmi-yellow/10 border border-hmi-yellow/30 rounded-lg px-4 py-2 text-sm text-hmi-yellow">
          ⚠️ QA 점수 낮음 — deterministic render로 폴백됩니다
        </div>
      )}
    </div>
  )
}