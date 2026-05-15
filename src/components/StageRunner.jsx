import React from 'react'

export default function StageRunner({ file, runMode, currentStep, stepResults, steps, onStepComplete, onLog, onRunComplete, onError, onRunId, running, setRunning }) {

  const runStep = async (stepIdx) => {
    const step = steps[stepIdx]
    setRunning(true)
    onLog(`[${new Date().toLocaleTimeString()}] ▶ ${step.label} 시작...`)

    const formData = new FormData()
    formData.append('file', file)
    formData.append('step', step.action)
    formData.append('config', 'default')

    try {
      const res = await fetch('/api/run-step', { method: 'POST', body: formData })
      const data = await res.json()

      if (data.error) {
        onLog(`[${step.label}] ❌ 오류: ${data.error}`)
        onError(data.error)
      } else {
        onLog(`[${step.label}] ✅ 완료 — ${JSON.stringify(data)}`)
        onStepComplete(stepIdx, data)
        if (stepIdx === 0 && data.run_id) onRunId(data.run_id)
      }
    } catch (err) {
      onLog(`[${step.label}] ❌ 네트워크 오류: ${err.message}`)
      onError(err.message)
    } finally {
      setRunning(false)
    }
  }

  const runAll = async () => {
    for (let i = 0; i < steps.length; i++) {
      await runStep(i)
      if (stepResults[i + 1] === undefined && i < steps.length - 1) {
        // wait for step to complete before next
      }
    }
    onLog('\n[🎉 전체 완료]')
    onRunComplete?.({ status: 'completed' })
  }

  const currentStepDone = stepResults[currentStep] !== undefined

  return (
    <div className="bg-hmi-surface border border-hmi-border rounded-xl p-4 flex items-center gap-4">

      {/* Status */}
      <div className="flex-1">
        <div className="text-sm">
          <span className="text-hmi-accent font-semibold">{steps[currentStep]?.label}</span>
          <span className="text-hmi-muted"> 단계</span>
          {currentStepDone ? (
            <span className="ml-2 text-hmi-green text-xs"> ✅ 완료</span>
          ) : (
            <span className="ml-2 text-hmi-yellow text-xs animate-pulse"> ⏳ 대기</span>
          )}
        </div>
        {runId && <div className="text-xs text-hmi-muted">Run ID: {runId}</div>}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">

        {/* Step mode: run current step */}
        {runMode === 'step' && !currentStepDone && (
          <button
            onClick={() => runStep(currentStep)}
            disabled={running}
            className="px-5 py-2.5 bg-hmi-accent text-white rounded-xl font-medium disabled:opacity-40 hover:bg-hmi-accent/80 transition-colors"
          >
            {running ? '⏳ 실행중...' : `▶ ${steps[currentStep]?.label} 실행`}
          </button>
        )}

        {/* Full mode: run all */}
        {runMode === 'full' && (
          <button
            onClick={runAll}
            disabled={running}
            className="px-5 py-2.5 bg-hmi-green text-white rounded-xl font-medium disabled:opacity-40 hover:bg-hmi-green/80 transition-colors"
          >
            {running ? '⏳ 실행중...' : '⚡ 한번에 실행'}
          </button>
        )}

        {/* Resume mode: run from current */}
        {runMode === 'resume' && currentStep > 0 && (
          <button
            onClick={() => runStep(currentStep)}
            disabled={running}
            className="px-5 py-2.5 bg-hmi-yellow text-black rounded-xl font-medium disabled:opacity-40 hover:bg-hmi-yellow/80 transition-colors"
          >
            {running ? '⏳ 실행중...' : `↻ 이어서: ${steps[currentStep]?.label}`}
          </button>
        )}

      </div>
    </div>
  )
}