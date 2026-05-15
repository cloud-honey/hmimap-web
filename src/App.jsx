import React, { useState } from 'react'
import Home from './pages/Home'
import History from './pages/History'
import Settings from './pages/Settings'

const TABS = [
  { id: 'home', label: '홈' },
  { id: 'history', label: '이력' },
  { id: 'settings', label: '설정' },
]

export default function App() {
  const [tab, setTab] = useState('home')

  return (
    <div className="min-h-screen bg-hmi-bg text-hmi-text">
      {/* Header */}
      <header className="border-b border-hmi-border px-6 py-4 flex items-center justify-between">
        <h1 className="text-xl font-bold">HMI Map Pipeline</h1>
        <nav className="flex gap-2">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                tab === t.id
                  ? 'bg-hmi-accent text-white'
                  : 'bg-hmi-surface text-hmi-muted hover:text-hmi-text border border-hmi-border'
              }`}
            >
              {t.label}
            </button>
          ))}
        </nav>
      </header>

      {/* Content */}
      <main className="p-6">
        {tab === 'home' && <Home />}
        {tab === 'history' && <History />}
        {tab === 'settings' && <Settings />}
      </main>
    </div>
  )
}