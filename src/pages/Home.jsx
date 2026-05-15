import React, { useState } from 'react'
import StepIndicator from '../components/StepIndicator'
import FileUploader from '../components/FileUploader'
import StageRunner from '../components/StageRunner'
import ResultPreview from '../components/ResultPreview'

const STEPS = [
  { label: '전처리', desc: 'Layer mapping', action: 'preprocess' },
  { label: '파싱', desc: 'Wall/Room/Column', action: 'parse' },
  { label: '렌더링', desc: 'ISO base render', action: 'render' },
  { label: 'AI 리파인', desc: 'SDXL + ControlNet', action: 'ai_refine' },
  { label: 'QA', desc: 'Quality check', action: 'qa' },
]

export default function Home() {
  const [file, setFile] = useState(null)
  const [currentStep, setCurrentStep] = useState(0)
  const [stepResults, setStepResults] = useState({})
  const [runMode, setRunMode] = useState('step')
  const [log, setLog] = useState('')
  const [runId, setRunId] = useState(null)
  const [running, setRunning] = useState(false)
  const [error, setError] = useState(null)

  const handleFileSelect = (f) => {
    setFile(f)
    setCurrentStep(0)
    setStepResults({})
    setLog('')
    setError(null)
    setRunId(null)
  }

  const handleStepComplete = (stepIdx, result) => {
    setStepResults(prev => ({ ...prev, [stepIdx]: result }))
    if (stepIdx < STEPS.length - 1) {
      setCurrentStep(stepIdx + 1)
    }
  }

  const handleLog = (line) => setLog(prev => prev + line + '\n')

  const handleRunComplete = (result) => {
    setRunning(false)
    setLog(prev => prev + '\n[완료] ' + JSON.stringify(result))
  }

  const handleError = (err) => {
    setRunning(false)
    setError(err)
    setLog(prev => prev + '\n[오류] ' + err)
  }

  return (
    <div className="space-y-6 max-w-5xl">

      {/* Run Mode Selector */}
      <div className="flex gap-4 items-center bg-hmi-surface border border-hmi-border rounded-xl p-4">
        <div className="text-sm text-hmi-muted font-medium">실행 모드:</div>
        {[
          { id: 'full', label: '⚡ 한번에 실행', color: 'bg-hmi-green' },
          { id: 'step', label: '🔍 단계별 검수', color: 'bg-hmi-accent' },
          { id: 'resume', label: '↻ 이어서 실행', color: 'bg-hmi-yellow' },
        ].map(m => (
          <button
            key={m.id}
            onClick={() => setRunMode(m.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              runMode === m.id
                ? `${m.color} text-white`
                : 'bg-hmi-bg text-hmi-muted border border-hmi-border hover:border-hmi-accent'
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>

      {/* Step Indicator */}
      <StepIndicator
        steps={STEPS}
        currentStep={currentStep}
        stepResults={stepResults}
        onStepClick={(idx) => {
          if (idx < currentStep || stepResults[idx]) {
            setCurrentStep(idx)
          }
        }}
      />

      {/* File Upload or Stage Runner */}
      {!file ? (
        <FileUploader onFileSelect={handleFileSelect} />
      ) : (
        <div className="space-y-4">
          {/* File info bar */}
          <div className="flex items-center gap-3 bg-hmi-surface border border-hmi-border rounded-xl px-4 py-3">
            <span className="text-2xl">📄</span>
            <div>
              <div className="font-medium">{file.name}</div>
              <div className="text-xs text-hmi-muted">{(file.size / 1024).toFixed(1)} KB</div>
            </div>
            <button
              onClick={() => { setFile(null); setStepResults({}); setLog(''); setError(null) }}
              className="ml-auto text-hmi-muted hover:text-hmi-red text-sm px-3 py-1 border border-hmi-border rounded-lg"
            >
              ✕ 초기화
            </button>
          </div>

          {/* Stage Runner */}
          <StageRunner
            file={file}
            runMode={runMode}
            currentStep={currentStep}
            stepResults={stepResults}
            steps={STEPS}
            onStepComplete={handleStepComplete}
            onLog={handleLog}
            onRunComplete={handleRunComplete}
            onError={handleError}
            onRunId={setRunId}
            running={running}
            setRunning={setRunning}
          />

          {/* Error display */}
          {error && (
            <div className="bg-hmi-red/10 border border-hmi-red/30 rounded-xl px-4 py-3 text-sm text-hmi-red">
              ❌ {error}
            </div>
          )}

          {/* Live Log */}
          {log && (
            <div className="bg-hmi-bg border border-hmi-border rounded-xl p-4">
              <div className="text-xs text-hmi-muted mb-2">📟 실시간 로그</div>
              <pre className="text-xs font-mono text-hmi-green overflow-x-auto max-h-52 whitespace-pre-wrap">{log}</pre>
            </div>
          )}

          {/* Current Step Result Preview */}
          {stepResults[currentStep] && (
            <ResultPreview
              step={currentStep}
              result={stepResults[currentStep]}
              steps={STEPS}
              onPass={() => {
                if (currentStep < STEPS.length - 1) {
                  setCurrentStep(currentStep + 1)
                }
              }}
              onRetry={() => {
                const newResults = { ...stepResults }
                delete newResults[currentStep]
                setStepResults(newResults)
              }}
            />
          )}
        </div>
      )}
    </div>
  )
}