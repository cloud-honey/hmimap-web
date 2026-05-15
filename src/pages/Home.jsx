import React, { useState, useRef } from 'react'
import StepIndicator from '../components/StepIndicator'
import FileUploader from '../components/FileUploader'
import StageRunner from '../components/StageRunner'
import ResultPreview from '../components/ResultPreview'

export default function Home() {
  const [file, setFile] = useState(null)
  const [currentStep, setCurrentStep] = useState(0)
  const [stepResults, setStepResults] = useState({})
  const [runMode, setRunMode] = useState('step') // 'full' | 'step' | 'resume'
  const [log, setLog] = useState('')
  const [selectedConfig, setSelectedConfig] = useState('default')
  const [runId, setRunId] = useState(null)

  const STEPS = [
    { label: '전처리', desc: 'Layer mapping + scale' },
    { label: '파싱', desc: 'Wall/Room/Column' },
    { label: '렌더링', desc: 'ISO base render' },
    { label: 'AI 리파인', desc: 'SDXL + ControlNet' },
    { label: 'QA', desc: 'Auto quality check' },
  ]

  const handleFileSelect = (f) => {
    setFile(f)
    setCurrentStep(0)
    setStepResults({})
    setLog('')
  }

  const handleStepComplete = (stepIdx, result) => {
    setStepResults(prev => ({ ...prev, [stepIdx]: result }))
    if (stepIdx < STEPS.length - 1) {
      setCurrentStep(stepIdx + 1)
    }
  }

  const handleStepLog = (line) => setLog(prev => prev + line + '\n')

  return (
    <div className="space-y-6">
      {/* Run Mode + Config */}
      <div className="flex gap-4 items-center bg-hmi-surface border border-hmi-border rounded-xl p-4">
        <div className="flex gap-2">
          {['full', 'step', 'resume'].map(m => (
            <button
              key={m}
              onClick={() => setRunMode(m)}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                runMode === m
                  ? 'bg-hmi-accent text-white'
                  : 'bg-hmi-bg text-hmi-muted border border-hmi-border'
              }`}
            >
              {m === 'full' ? '한번에' : m === 'step' ? '단계별' : '특정 단계부터'}
            </button>
          ))}
        </div>
        <div className="ml-auto flex gap-2 items-center text-sm text-hmi-muted">
          Config:
          <select
            value={selectedConfig}
            onChange={e => setSelectedConfig(e.target.value)}
            className="bg-hmi-bg border border-hmi-border rounded-lg px-3 py-2 text-hmi-text"
          >
            <option value="default">default.json</option>
            <option value="low_quality">low_quality.json</option>
            <option value="high_detail">high_detail.json</option>
          </select>
        </div>
      </div>

      {/* Step Indicator */}
      <StepIndicator steps={STEPS} currentStep={currentStep} />

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
              onClick={() => setFile(null)}
              className="ml-auto text-hmi-muted hover:text-hmi-red text-sm"
            >
              ✕
            </button>
          </div>

          {/* Stage Runner */}
          <StageRunner
            file={file}
            runMode={runMode}
            currentStep={currentStep}
            stepResults={stepResults}
            config={selectedConfig}
            onStepComplete={handleStepComplete}
            onLog={handleStepLog}
            onRunId={setRunId}
          />

          {/* Live Log */}
          {log && (
            <div className="bg-hmi-bg border border-hmi-border rounded-xl p-4">
              <div className="text-xs text-hmi-muted mb-2">실시간 로그</div>
              <pre className="text-xs font-mono text-hmi-green overflow-x-auto max-h-48 whitespace-pre-wrap">
                {log}
              </pre>
            </div>
          )}

          {/* Current Step Result Preview */}
          {stepResults[currentStep] && (
            <ResultPreview
              step={currentStep}
              result={stepResults[currentStep]}
              onPass={() => {
                if (currentStep < STEPS.length - 1) setCurrentStep(currentStep + 1)
              }}
              onRetry={() => handleStepComplete(currentStep, null)}
            />
          )}
        </div>
      )}
    </div>
  )
}