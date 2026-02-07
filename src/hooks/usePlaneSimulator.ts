import { useEffect, useRef, useState } from 'react'
import type { PlanePosition } from '../types'

const CENTER_LON = -0.09
const CENTER_LAT = 51.505
const RADIUS_DEG = 0.015 // ~1.5 km
const LOOP_DURATION = 60 // seconds for a full circle
const TICK_MS = 1000
const TRAIL_SECONDS = 20

export function usePlaneSimulator(): PlanePosition[] {
  const [trail, setTrail] = useState<PlanePosition[]>([])
  const startTime = useRef(Date.now())

  useEffect(() => {
    const id = setInterval(() => {
      const now = Date.now()
      const elapsed = (now - startTime.current) / 1000
      const angle = (elapsed / LOOP_DURATION) * 2 * Math.PI

      const lon = CENTER_LON + RADIUS_DEG * Math.cos(angle)
      const lat = CENTER_LAT + RADIUS_DEG * Math.sin(angle)
      const heading = angle + Math.PI / 2 // tangent direction

      const position: PlanePosition = { lon, lat, heading, timestamp: now }

      setTrail(prev => {
        const cutoff = now - TRAIL_SECONDS * 1000
        return [...prev.filter(p => p.timestamp > cutoff), position]
      })
    }, TICK_MS)

    return () => clearInterval(id)
  }, [])

  return trail
}
