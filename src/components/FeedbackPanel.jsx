import React, { useState } from 'react'

export default function FeedbackPanel({ runId, currentStep }) {
  const [rating, setRating] = useState(null) // 'good' | 'bad'
  const [issueType, setIssueType] = useState('')
  const [comment, setComment] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const ISSUE_TYPES = [
    { value: 'wall', label: '벽이 잘못됨' },
    { value: 'color', label: '색상이 이상함' },
    { value: 'artifact', label: 'AI가 추가 객체를 생성함' },
    { value: 'render', label: '렌더링 왜곡' },
    { value: 'other', label: '기타' },
  ]

  const handleSubmit = async () => {
    if (!rating) return
    setSubmitting(true)
    try {
      await fetch('/api/feedbacks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ run_id: runId, step: currentStep, rating, issue_type: issueType, comment }),
      })
      setSubmitted(true)
    } catch (e) {
      console.error('Failed to submit feedback:', e)
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div className="bg-hmi-green/10 border border-hmi-green/30 rounded-xl px-5 py-4 text-center">
        <div className="text-2xl mb-2">✅</div>
        <div className="text-sm font-medium text-hmi-green">피드백이 전송되었습니다</div>
        <div className="text-xs text-hmi-muted mt-1">감사합니다! 더 나은 결과를 위해 반영하겠습니다.</div>
      </div>
    )
  }

  return (
    <div className="bg-hmi-surface border border-hmi-border rounded-xl p-5 space-y-4">
      <div className="font-semibold text-hmi-accent">💬 피드백</div>

      {/* Rating */}
      <div className="flex gap-3">
        <button
          onClick={() => setRating('good')}
          className={`flex-1 py-3 rounded-xl border-2 text-lg transition-all ${
            rating === 'good'
              ? 'border-hmi-green bg-hmi-green/10 text-hmi-green'
              : 'border-hmi-border text-hmi-muted hover:border-hmi-green/50'
          }`}
        >
          👍 좋아요
        </button>
        <button
          onClick={() => setRating('bad')}
          className={`flex-1 py-3 rounded-xl border-2 text-lg transition-all ${
            rating === 'bad'
              ? 'border-hmi-red bg-hmi-red/10 text-hmi-red'
              : 'border-hmi-border text-hmi-muted hover:border-hmi-red/50'
          }`}
        >
          👎 문제가 있었어요
        </button>
      </div>

      {/* Issue type (only if bad) */}
      {rating === 'bad' && (
        <>
          <div className="text-xs text-hmi-muted">어떤 문제가 있었나요?</div>
          <div className="flex flex-wrap gap-2">
            {ISSUE_TYPES.map(t => (
              <button
                key={t.value}
                onClick={() => setIssueType(t.value)}
                className={`px-3 py-1.5 rounded-lg text-xs border transition-colors ${
                  issueType === t.value
                    ? 'border-hmi-red bg-hmi-red/10 text-hmi-red'
                    : 'border-hmi-border text-hmi-muted hover:border-hmi-red/50'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Comment */}
          <textarea
            value={comment}
            onChange={e => setComment(e.target.value)}
            placeholder="추가 설명 (선택)"
            className="w-full bg-hmi-bg border border-hmi-border rounded-lg px-3 py-2 text-sm resize-none h-20"
          />
        </>
      )}

      {/* Submit */}
      {rating && (
        <button
          onClick={handleSubmit}
          disabled={submitting || (rating === 'bad' && !issueType)}
          className="w-full py-2.5 bg-hmi-accent text-white rounded-xl font-medium disabled:opacity-40 hover:bg-hmi-accent/80 transition-colors"
        >
          {submitting ? '전송 중...' : '📨 피드백 전송'}
        </button>
      )}
    </div>
  )
}