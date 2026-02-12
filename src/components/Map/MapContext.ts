import { createContext, useContext } from 'react'
import type OLMap from 'ol/Map'

const MapContext = createContext<OLMap | null>(null)

export const MapProvider = MapContext.Provider

export function useOLMap(): OLMap {
  const map = useContext(MapContext)
  if (!map) throw new Error('useOLMap must be used inside <Map>')
  return map
}
