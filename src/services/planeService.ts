export type AircraftType = 'fixedWing' | 'fighter' | 'rotaryWing' | 'tanker' | 'cargo'

export interface AircraftPosition {
  id: string
  latitude: number
  longitude: number
  altitude: number // feet
  type: AircraftType
}

export type PlaneUpdateCallback = (positions: AircraftPosition[]) => void

/**
 * Service interface for receiving aircraft positions.
 * Implement this for gRPC or any other backend.
 */
export interface PlaneService {
  subscribe(callback: PlaneUpdateCallback): () => void
  start(): void
  stop(): void
}
