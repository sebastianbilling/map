import { useMemo } from 'react'

const PLANE_COUNT = 100
const BASE_LON = -0.09
const BASE_LAT = 51.505
const SPREAD_LON = 0.06
const SPREAD_LAT = 0.04

export interface PlaneConfig {
  centerLon: number
  centerLat: number
  radius: number
  loopDuration: number
  direction: 1 | -1
  startAngle: number
  hue: number
}

function seededRandom(seed: number) {
  let s = seed
  return () => {
    s = (s * 16807 + 0) % 2147483647
    return (s - 1) / 2147483646
  }
}

function generateConfigs(): PlaneConfig[] {
  const rand = seededRandom(42)
  return Array.from({ length: PLANE_COUNT }, () => ({
    centerLon: BASE_LON + (rand() - 0.5) * 2 * SPREAD_LON,
    centerLat: BASE_LAT + (rand() - 0.5) * 2 * SPREAD_LAT,
    radius: 0.005 + rand() * 0.02,
    loopDuration: 30 + rand() * 90,
    direction: (rand() > 0.5 ? 1 : -1) as 1 | -1,
    startAngle: rand() * Math.PI * 2,
    hue: Math.round(rand() * 360),
  }))
}

export function computePosition(cfg: PlaneConfig, elapsedSeconds: number) {
  const angle =
    cfg.startAngle +
    cfg.direction * (elapsedSeconds / cfg.loopDuration) * 2 * Math.PI
  return {
    lon: cfg.centerLon + cfg.radius * Math.cos(angle),
    lat: cfg.centerLat + cfg.radius * Math.sin(angle),
  }
}

export function usePlaneConfigs(): PlaneConfig[] {
  return useMemo(generateConfigs, [])
}
