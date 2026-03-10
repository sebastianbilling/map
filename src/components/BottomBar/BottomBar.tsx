import './BottomBar.css'

interface BottomBarProps {
  text: string
}

export function BottomBar({ text }: BottomBarProps) {
  return (
    <footer className="bottom-bar">
      <span className="bottom-bar-item">{text}</span>
    </footer>
  )
}
