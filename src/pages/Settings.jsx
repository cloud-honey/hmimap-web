import React, { useState } from 'react'

const DEFAULT_CONFIG = {
  ai_refinement: { enabled: true, denoise_strength: 0.3, tile_size: 512 },
  qa: { threshold_alignment: 0.75, threshold_color: 0.8, threshold_artifact: 0.7 },
  renderer: { wall_height_mm: 3000, wall_thickness_mm: 200, bg_color: [40, 40, 40] },
}

export default function Settings() {
  const [config, setConfig] = useState(DEFAULT_CONFIG)
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    fetch('/api/configs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'default', config: JSON.stringify(config) }),
    }).then(() => { setSaved(true); setTimeout(() => setSaved(false), 2000) })
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">설정</h2>
        <button onClick={handleSave} className="px-5 py-2 bg-hmi-green text-white rounded-xl font-medium text-sm">
          {saved ? '✅ 저장됨' : '💾 저장'}
        </button>
      </div>

      {/* AI Refinement */}
      <div className="bg-hmi-surface border border-hmi-border rounded-xl p-5 space-y-4">
        <h3 className="font-semibold text-hmi-accent">🤖 AI 리파인먼트</h3>
        <label className="flex items-center gap-3">
          <input type="checkbox" checked={config.ai_refinement.enabled}
            onChange={e => setConfig({...config, ai_refinement: {...config.ai_refinement, enabled: e.target.checked}})}
            className="w-5 h-5" />
          <span>AI 리파인먼트 활성화</span>
        </label>
        <div>
          <label className="text-sm text-hmi-muted">Denoise strength: {config.ai_refinement.denoise_strength}</label>
          <input type="range" min="0" max="0.5" step="0.05"
            value={config.ai_refinement.denoise_strength}
            onChange={e => setConfig({...config, ai_refinement: {...config.ai_refinement, denoise_strength: parseFloat(e.target.value)}})}
            className="w-full" />
          <div className="text-xs text-hmi-muted">낮을수록 원본 구조 유지 (0.25~0.35 추천)</div>
        </div>
        <div>
          <label className="text-sm text-hmi-muted">Tile size: {config.ai_refinement.tile_size}px</label>
          <select value={config.ai_refinement.tile_size}
            onChange={e => setConfig({...config, ai_refinement: {...config.ai_refinement, tile_size: parseInt(e.target.value)}})}
            className="w-full bg-hmi-bg border border-hmi-border rounded-lg px-3 py-2">
            <option value={512}>512px (VRAM 4GB 이하)</option>
            <option value={768}>768px (VRAM 8GB)</option>
            <option value={1024}>1024px (VRAM 12GB+)</option>
          </select>
        </div>
      </div>

      {/* QA Thresholds */}
      <div className="bg-hmi-surface border border-hmi-border rounded-xl p-5 space-y-4">
        <h3 className="font-semibold text-hmi-purple">📊 QA Threshold</h3>
        {[
          { key: 'alignment', label: 'Alignment', desc: '구조 정렬' },
          { key: 'color', label: 'Color', desc: '색상 규칙' },
          { key: 'artifact', label: 'Artifact', desc: '잔상물 탐지' },
        ].map(({ key, label, desc }) => (
          <div key={key}>
            <label className="text-sm text-hmi-muted">{label} ({desc}): {config.qa[`threshold_${key}`]}</label>
            <input type="range" min="0.5" max="1.0" step="0.05"
              value={config.qa[`threshold_${key}`]}
              onChange={e => setConfig({...config, qa: {...config.qa, [`threshold_${key}`]: parseFloat(e.target.value)}})}
              className="w-full" />
          </div>
        ))}
      </div>

      {/* Renderer */}
      <div className="bg-hmi-surface border border-hmi-border rounded-xl p-5 space-y-4">
        <h3 className="font-semibold text-hmi-yellow">🏗️ 렌더링</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-hmi-muted">벽 높이 (mm)</label>
            <input type="number" value={config.renderer.wall_height_mm}
              onChange={e => setConfig({...config, renderer: {...config.renderer, wall_height_mm: parseInt(e.target.value)}})}
              className="w-full bg-hmi-bg border border-hmi-border rounded-lg px-3 py-2 mt-1" />
          </div>
          <div>
            <label className="text-xs text-hmi-muted">벽 두께 (mm)</label>
            <input type="number" value={config.renderer.wall_thickness_mm}
              onChange={e => setConfig({...config, renderer: {...config.renderer, wall_thickness_mm: parseInt(e.target.value)}})}
              className="w-full bg-hmi-bg border border-hmi-border rounded-lg px-3 py-2 mt-1" />
          </div>
        </div>
      </div>
    </div>
  )
}