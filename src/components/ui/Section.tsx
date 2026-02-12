import type { ComponentChildren } from 'preact'
import './ui.css'

interface SectionProps {
  title: string
  children: ComponentChildren
}

export function Section({ title, children }: SectionProps) {
  return (
    <div className="section">
      <h3 className="section-title">{title}</h3>
      {children}
    </div>
  )
}
