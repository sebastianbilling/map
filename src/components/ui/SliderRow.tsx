import './ui.css'

interface SliderRowProps {
  label: string
  min: number
  max: number
  value: number
  onChange: (value: number) => void
}

export function SliderRow({ label, min, max, value, onChange }: SliderRowProps) {
  return (
    <label className="setting-row">
      <span>{label}</span>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.currentTarget.value))}
      />
    </label>
  )
}
