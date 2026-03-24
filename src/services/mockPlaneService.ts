import type { AircraftPosition, AircraftType, PlaneService, PlaneUpdateCallback } from './planeService'

const PLANE_COUNT = 100
const BASE_LON = -0.09
const BASE_LAT = 51.505
const SPREAD_LON = 0.06
const SPREAD_LAT = 0.04
const UPDATE_INTERVAL_MS = 50 // 20Hz — smooth enough, easy on CPU

const AIRCRAFT_TYPES: AircraftType[] = ['fixedWing', 'fighter', 'rotaryWing', 'tanker', 'cargo']

interface FlightConfig {
  id: string
  centerLon: number
  centerLat: number
  radius: number
  loopDuration: number
  direction: 1 | -1
  startAngle: number
  altitude: number
  type: AircraftType
}

function seededRandom(seed: number) {
  let s = seed
  return () => {
    s = (s * 16807 + 0) % 2147483647
    return (s - 1) / 2147483646
  }
}

function generateFlights(): FlightConfig[] {
  const rand = seededRandom(42)
  return Array.from({ length: PLANE_COUNT }, (_, i) => ({
    id: `mock-${i}`,
    centerLon: BASE_LON + (rand() - 0.5) * 2 * SPREAD_LON,
    centerLat: BASE_LAT + (rand() - 0.5) * 2 * SPREAD_LAT,
    radius: 0.005 + rand() * 0.02,
    loopDuration: 30 + rand() * 90,
    direction: (rand() > 0.5 ? 1 : -1) as 1 | -1,
    startAngle: rand() * Math.PI * 2,
    altitude: 5000 + Math.round(rand() * 35000),
    type: AIRCRAFT_TYPES[Math.floor(rand() * AIRCRAFT_TYPES.length)],
  }))
}

function computePosition(cfg: FlightConfig, elapsed: number): AircraftPosition {
  const angle = cfg.startAngle + cfg.direction * (elapsed / cfg.loopDuration) * 2 * Math.PI
  return {
    id: cfg.id,
    latitude: cfg.centerLat + cfg.radius * Math.sin(angle),
    longitude: cfg.centerLon + cfg.radius * Math.cos(angle),
    altitude: cfg.altitude,
    type: cfg.type,
  }
}

export function createMockPlaneService(): PlaneService {
  const flights = generateFlights()
  const listeners = new Set<PlaneUpdateCallback>()
  let intervalId: ReturnType<typeof setInterval> | null = null
  let startTime = 0

  function tick() {
    const elapsed = (performance.now() - startTime) / 1000
    const positions = flights.map(f => computePosition(f, elapsed))
    for (const cb of listeners) cb(positions)
  }

  return {
    subscribe(callback) {
      listeners.add(callback)
      return () => { listeners.delete(callback) }
    },

    start() {
      if (intervalId != null) return
      startTime = performance.now()
      intervalId = setInterval(tick, UPDATE_INTERVAL_MS)
      tick() // emit immediately
    },

    stop() {
      if (intervalId != null) {
        clearInterval(intervalId)
        intervalId = null
      }
      listeners.clear()
    },
  }
}
