import type { Place } from '../../types'
import './ui.css'

interface PlaceListProps {
  places: Place[]
}

export function PlaceList({ places }: PlaceListProps) {
  return (
    <ul className="place-list">
      {places.map((place) => (
        <li key={place.name} className="place-item">
          <span className="place-name">{place.name}</span>
          <span className="place-distance">{place.distance}</span>
        </li>
      ))}
    </ul>
  )
}
