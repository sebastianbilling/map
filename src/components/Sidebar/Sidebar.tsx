import { useState } from 'preact/hooks'
import type { ComponentChildren } from 'preact'
import './Sidebar.css'

interface PanelConfig {
  id: string
  icon: string
  title: string
  content: ComponentChildren
}

interface SidebarProps {
  panels: PanelConfig[]
}

export function Sidebar({ panels }: SidebarProps) {
  const [activePanel, setActivePanel] = useState<string | null>(null)

  const toggle = (id: string) => {
    setActivePanel((prev) => (prev === id ? null : id))
  }

  const active = panels.find((p) => p.id === activePanel)

  return (
    <div className="sidebar-container">
      <nav className="icon-rail">
        {panels.map((panel) => (
          <button
            key={panel.id}
            className={`rail-btn${activePanel === panel.id ? ' active' : ''}`}
            onClick={() => toggle(panel.id)}
            aria-label={panel.title}
            title={panel.title}
          >
            {panel.icon}
          </button>
        ))}
      </nav>

      {active && (
        <aside className="sidebar-panel">
          <div className="sidebar-panel-header">
            <h2 className="sidebar-panel-title">{active.title}</h2>
            <button
              className="sidebar-panel-close"
              onClick={() => setActivePanel(null)}
              aria-label="Close panel"
            >
              ✕
            </button>
          </div>
          <div className="sidebar-panel-content">
            {active.content}
          </div>
        </aside>
      )}
    </div>
  )
}
