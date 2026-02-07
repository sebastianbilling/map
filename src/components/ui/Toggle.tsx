import './ui.css'

interface ToggleProps {
  label: string
  checked: boolean
  onChange: () => void
}

export function Toggle({ label, checked, onChange }: ToggleProps) {
  return (
    <label className="setting-row">
      <span>{label}</span>
      <input type="checkbox" checked={checked} onChange={onChange} />
    </label>
  )
}
