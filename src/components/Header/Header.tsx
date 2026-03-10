import type { Theme } from '../../hooks/useTheme'
import './Header.css'

interface HeaderProps {
  theme: Theme
  onThemeChange: (theme: Theme) => void
}

const options: Theme[] = ['light', 'system', 'dark']

export function Header({ theme, onThemeChange }: HeaderProps) {
  return (
    <header className="header">
      <span className="header-title">My Map</span>
      <div className="header-actions">
        <div className="theme-switcher">
          {options.map((option) => (
            <button
              key={option}
              className={`theme-btn${theme === option ? ' active' : ''}`}
              onClick={() => onThemeChange(option)}
            >
              {option === 'light' ? '☀' : option === 'dark' ? '☾' : '◐'}
            </button>
          ))}
        </div>
      </div>
    </header>
  )
}
