import React from 'react'

export default function StageRunner({ file, runMode, currentStep, stepResults, config, onStepComplete, onLog, onRunId }) {
  const [running, setRunning] = React.useState(false)

  const STEPS = [
    { cmd: 'preprocess', label: '전처리' },
    { cmd: 'parse', label: '파싱' },
    { cmd: 'render', label: '렌더링' },
    { cmd: 'ai_refine', label: 'AI 리파인' },
    { cmd: 'qa', label: 'QA' },
  ]

  const runStep = async (stepIdx) => {
    setRunning(true)
    onLog(`[${new Date().toLocaleTimeString()}] Starting: ${STEPS[stepIdx].label}\n`)

    const formData = new FormData()
    formData.append('file', file)
    formData.append('step', STEPS[stepIdx].cmd)
    formData.append('config', config)

    try {
      const res = await fetch('/api/run-step', {
        method: 'POST',
        body: formData,
      })
      const data = await res.json()

      if (data.error) {
        onLog(`[ERROR] ${data.error}\n`)
      } else {
        onLog(`[OK] ${data.message || 'done'}\n`)
        onStepComplete(stepIdx, data)
      }
    } catch (err) {
      onLog(`[NETWORK ERROR] ${err.message}\n`)
    } finally {
      setRunning(false)
    }
  }

  const runAll = async () => {
    for (let i = 0; i < STEPS.length; i++) {
      setRunning(true)
      onLog(`[STEP ${i+1}] ${STEPS[i].label}\n`)
      await runStep(i)
    }
  }

  return (
    <div className="bg-hmi-surface border border-hmi-border rounded-xl p-4 flex items-center gap-4">
      <div className="text-sm text-hmi-muted">
        {file.name} — <span className="text-hmi-accent">{STEPS[currentStep]?.label}</span> 단계
        {stepResults[currentStep] ? ' ✅' : ' ⏳'}
      </div>
      <div className="ml-auto flex gap-2">
        {runMode === 'step' && !stepResults[currentStep] && (
          <button
            onClick={() => runStep(currentStep)}
            disabled={running}
            className="px-5 py-2.5 bg-hmi-accent text-white rounded-xl font-medium disabled:opacity-50 hover:bg-hmi-accent/80 transition-colors"
          >
            {running ? '실행중...' : '▶ 실행'}
          </button>
        )}
        {runMode === 'full' && (
          <button
            onClick={runAll}
            disabled={running}
            className="px-5 py-2.5 bg-hmi-green text-white rounded-xl font-medium disabled:opacity-50 hover:bg-hmi-green/80 transition-colors"
          >
            {running ? '실행중...' : '⚡ 한번에 실행'}
          </button>
        )}
        {runMode === 'resume' && currentStep > 0 && (
          <button
            onClick={() => runStep(currentStep)}
            disabled={running}
            className="px-5 py-2.5 bg-hmi-yellow text-black rounded-xl font-medium disabled:opacity-50 hover:bg-hmi-yellow/80 transition-colors"
          >
            {running ? '실행중...' : '↻ 이어서 실행'}
          </button>
        )}
      </div>
    </div>
  )
}