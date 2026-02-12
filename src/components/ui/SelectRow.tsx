import './ui.css'

interface SelectOption {
  value: string
  label: string
}

interface SelectRowProps {
  label: string
  value: string
  options: SelectOption[]
  onChange: (value: string) => void
}

export function SelectRow({ label, value, options, onChange }: SelectRowProps) {
  return (
    <label className="setting-row">
      <span>{label}</span>
      <select value={value} onChange={(e) => onChange(e.currentTarget.value)}>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </label>
  )
}
