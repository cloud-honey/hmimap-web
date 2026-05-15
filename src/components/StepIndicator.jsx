import React from 'react'

export default function StepIndicator({ steps, currentStep, stepResults = {} }) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2">
      {steps.map((step, idx) => {
        const done = stepResults[idx] !== undefined && stepResults[idx] !== null
        const active = idx === currentStep

        return (
          <React.Fragment key={idx}>
            <div className={`flex flex-col items-center gap-1 px-4 py-3 rounded-xl border transition-all min-w-[100px] ${
              active
                ? 'bg-hmi-accent border-hmi-accent text-white'
                : done
                ? 'bg-hmi-surface border-hmi-green text-hmi-green'
                : 'bg-hmi-surface border-hmi-border text-hmi-muted'
            }`}>
              <div className="text-lg font-bold">{idx + 1}️⃣</div>
              <div className="text-xs font-medium text-center">{step.label}</div>
              <div className="text-[10px] opacity-70 text-center">{step.desc}</div>
            </div>
            {idx < steps.length - 1 && (
              <div className={`w-8 h-0.5 flex-shrink-0 ${
                idx < currentStep || (done && idx === currentStep - 1) ? 'bg-hmi-green' : 'bg-hmi-border'
              }`} />
            )}
          </React.Fragment>
        )
      })}
    </div>
  )
}