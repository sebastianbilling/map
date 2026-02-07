import type { ReactNode } from 'react'
import './Sidebar.css'

interface SidebarProps {
  side: 'left' | 'right'
  title: string
  children: ReactNode
}

export function Sidebar({ side, title, children }: SidebarProps) {
  return (
    <aside className={`sidebar sidebar-${side}`}>
      <h2 className="sidebar-title">{title}</h2>
      {children}
    </aside>
  )
}
