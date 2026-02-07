import './ui.css'

interface RadioPillsProps<T extends string> {
  options: T[]
  value: T
  onChange: (value: T) => void
}

export function RadioPills<T extends string>({ options, value, onChange }: RadioPillsProps<T>) {
  return (
    <div className="radio-group">
      {options.map((option) => (
        <label key={option} className={`radio-pill${value === option ? ' active' : ''}`}>
          <input
            type="radio"
            name="radio-pills"
            value={option}
            checked={value === option}
            onChange={() => onChange(option)}
          />
          {option.charAt(0).toUpperCase() + option.slice(1)}
        </label>
      ))}
    </div>
  )
}
