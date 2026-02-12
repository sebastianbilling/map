import { useState } from 'preact/hooks'
import type { ComponentChildren } from 'preact'
import './Sidebar.css'

interface SidebarProps {
  side: 'left' | 'right'
  title: string
  children: ComponentChildren
}

export function Sidebar({ side, title, children }: SidebarProps) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        className={`sidebar-toggle sidebar-toggle-${side}`}
        onClick={() => setOpen(true)}
        aria-label={`Open ${title}`}
      >
        {side === 'left' ? '⚙' : '◉'}
      </button>

      {open && (
        <div className="sidebar-backdrop" onClick={() => setOpen(false)} />
      )}

      <aside className={`sidebar sidebar-${side} ${open ? 'sidebar-open' : ''}`}>
        <div className="sidebar-header">
          <h2 className="sidebar-title">{title}</h2>
          <button
            className="sidebar-close"
            onClick={() => setOpen(false)}
            aria-label={`Close ${title}`}
          >
            ✕
          </button>
        </div>
        {children}
      </aside>
    </>
  )
}
