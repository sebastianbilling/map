import { useEffect, useRef } from 'preact/hooks'
import VectorLayer from 'ol/layer/Vector'
import VectorSource from 'ol/source/Vector'
import { fromLonLat } from 'ol/proj'
import { Feature } from 'ol'
import { LineString, Point } from 'ol/geom'
import { Stroke, Style, Icon } from 'ol/style'
import ms from 'milsymbol'

import { useOLMap } from './MapContext'
import { createMockPlaneService } from '../../services/mockPlaneService'
import type { AircraftPosition, AircraftType } from '../../services/planeService'

const TRAIL_LENGTH = 10
const TRAIL_DURATION_S = 20
const SAMPLE_INTERVAL_MS = (TRAIL_DURATION_S / TRAIL_LENGTH) * 1000

const SIDC_MAP: Record<AircraftType, string> = {
  fixedWing:  'SFAPMF----*****',
  fighter:    'SFAPMFM---*****',
  rotaryWing: 'SFAPMH----*****',
  tanker:     'SFAPMFK---*****',
  cargo:      'SFAPMFC---*****',
}

function createMilSymbolStyle(sidc: string): Style {
  const sym = new ms.Symbol(sidc, { size: 24 })
  const anchor = sym.getAnchor()
  return new Style({
    image: new Icon({
      src: sym.toDataURL(),
      anchor: [anchor.x, anchor.y],
      anchorXUnits: 'pixels',
      anchorYUnits: 'pixels',
      scale: 1,
    }),
  })
}

const styleCache = new Map<string, Style>()
function getMarkerStyle(type: AircraftType): Style {
  const sidc = SIDC_MAP[type]
  let style = styleCache.get(sidc)
  if (!style) {
    style = createMilSymbolStyle(sidc)
    styleCache.set(sidc, style)
  }
  return style
}

const trailStyles: Style[] = []
for (let i = 0; i < TRAIL_LENGTH; i++) {
  const opacity = Math.max(0.05, (i + 1) / TRAIL_LENGTH)
  trailStyles.push(new Style({
    stroke: new Stroke({
      color: `rgba(100,180,255,${opacity})`,
      width: 1 + 2 * opacity,
    }),
  }))
}

interface PlaneState {
  history: [number, number][]
  lastSampleTime: number
  trailFeatures: Feature[]
  markerFeature: Feature
}

export function PlaneLayer() {
  const map = useOLMap()
  const positionsRef = useRef<AircraftPosition[]>([])
  const dirtyRef = useRef(false)
  const planesRef = useRef<Map<string, PlaneState>>(new Map())

  // Service lifecycle — writes to ref, no React state
  useEffect(() => {
    // Swap this factory when the real gRPC backend is ready
    const service = createMockPlaneService()
    const unsub = service.subscribe(positions => {
      positionsRef.current = positions
      dirtyRef.current = true
      map.render() // request a single OL frame
    })
    service.start()
    return () => { unsub(); service.stop() }
  }, [map])

  // Layer setup — runs once
  useEffect(() => {
    const source = new VectorSource()
    const layer = new VectorLayer({
      source,
      updateWhileInteracting: true,
      updateWhileAnimating: true,
    })
    map.addLayer(layer)

    const onPostRender = () => {
      if (!dirtyRef.current) return
      dirtyRef.current = false

      const positions = positionsRef.current
      if (positions.length === 0) return

      const planes = planesRef.current
      const now = performance.now()

      for (const pos of positions) {
        let state = planes.get(pos.id)

        if (!state) {
          const trailFeatures: Feature[] = []
          for (let i = 0; i < TRAIL_LENGTH; i++) {
            const f = new Feature({ geometry: new LineString([[0, 0], [0, 0]]) })
            f.setStyle(trailStyles[i])
            trailFeatures.push(f)
          }
          const markerFeature = new Feature({ geometry: new Point([0, 0]) })
          markerFeature.setStyle(getMarkerStyle(pos.type))

          state = { history: [], lastSampleTime: 0, trailFeatures, markerFeature }
          planes.set(pos.id, state)
          source.addFeatures(trailFeatures)
          source.addFeature(markerFeature)
        }

        const coord: [number, number] = [pos.longitude, pos.latitude]

        if (now - state.lastSampleTime >= SAMPLE_INTERVAL_MS) {
          state.history.push(coord)
          state.lastSampleTime = now
          if (state.history.length > TRAIL_LENGTH) {
            state.history.splice(0, state.history.length - TRAIL_LENGTH)
          }
        }

        const h = state.history
        const totalSegs = h.length
        for (let i = 0; i < TRAIL_LENGTH; i++) {
          const geom = state.trailFeatures[i].getGeometry() as LineString
          const segIdx = i - (TRAIL_LENGTH - totalSegs)
          if (segIdx < 0) {
            geom.setCoordinates([[0, 0], [0, 0]])
          } else if (segIdx < h.length - 1) {
            geom.setCoordinates([fromLonLat(h[segIdx]), fromLonLat(h[segIdx + 1])])
          } else if (segIdx === h.length - 1) {
            geom.setCoordinates([fromLonLat(h[segIdx]), fromLonLat(coord)])
          } else {
            geom.setCoordinates([[0, 0], [0, 0]])
          }
        }

        const markerGeom = state.markerFeature.getGeometry() as Point
        markerGeom.setCoordinates(fromLonLat(coord))
      }

      // One more render to display the updated geometries, then stops
      // (dirtyRef is false, so next postrender is a no-op)
      map.render()
    }

    map.on('postrender', onPostRender)

    return () => {
      map.un('postrender', onPostRender)
      map.removeLayer(layer)
      planesRef.current.clear()
    }
  }, [map])

  return null
}
