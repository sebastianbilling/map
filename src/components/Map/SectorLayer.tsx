import { useEffect } from 'preact/hooks'
import VectorLayer from 'ol/layer/Vector'
import VectorSource from 'ol/source/Vector'
import { fromLonLat, toLonLat } from 'ol/proj'
import { Feature } from 'ol'
import { Polygon, Point } from 'ol/geom'
import { Fill, Stroke, Style, Circle as CircleStyle, Text as OLText } from 'ol/style'
import Pointer from 'ol/interaction/Pointer'

import { useOLMap } from './MapContext'

const ARC_POINTS = 64

function destinationPoint(lat: number, lon: number, distKm: number, bearingDeg: number): [number, number] {
  const R = 6371
  const d = distKm / R
  const brng = (bearingDeg * Math.PI) / 180
  const lat1 = (lat * Math.PI) / 180
  const lon1 = (lon * Math.PI) / 180
  const lat2 = Math.asin(
    Math.sin(lat1) * Math.cos(d) + Math.cos(lat1) * Math.sin(d) * Math.cos(brng)
  )
  const lon2 = lon1 + Math.atan2(
    Math.sin(brng) * Math.sin(d) * Math.cos(lat1),
    Math.cos(d) - Math.sin(lat1) * Math.sin(lat2)
  )
  return [(lon2 * 180) / Math.PI, (lat2 * 180) / Math.PI]
}

function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

function initialBearing(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const φ1 = lat1 * Math.PI / 180
  const φ2 = lat2 * Math.PI / 180
  const Δλ = (lon2 - lon1) * Math.PI / 180
  const y = Math.sin(Δλ) * Math.cos(φ2)
  const x = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ)
  return ((Math.atan2(y, x) * 180 / Math.PI) + 360) % 360
}

function normalizeBearing(deg: number): number {
  return ((deg % 360) + 360) % 360
}

function angleDiff(from: number, to: number): number {
  let d = normalizeBearing(to) - normalizeBearing(from)
  if (d > 180) d -= 360
  if (d < -180) d += 360
  return d
}

type HandleId = 'center' | 'range' | 'left' | 'right'

function handleStyle(color: string, label?: string): Style {
  return new Style({
    image: new CircleStyle({
      radius: 7,
      fill: new Fill({ color }),
      stroke: new Stroke({ color: '#fff', width: 2 }),
    }),
    text: label
      ? new OLText({
          text: label,
          offsetY: -18,
          fill: new Fill({ color: '#fff' }),
          stroke: new Stroke({ color: 'rgba(0,0,0,0.7)', width: 3 }),
          font: 'bold 11px sans-serif',
        })
      : undefined,
  })
}

const sectorStyle = new Style({
  fill: new Fill({ color: 'rgba(0, 255, 100, 0.10)' }),
  stroke: new Stroke({ color: 'rgba(0, 255, 100, 0.5)', width: 1.5 }),
})

export function SectorLayer() {
  const map = useOLMap()

  useEffect(() => {
    // Mutable sector state
    let centerLon = 11.97
    let centerLat = 57.7
    let rangeKm = 100
    let fovDeg = 90
    let bearing = 0

    // Features
    const sectorFeature = new Feature()
    sectorFeature.setStyle(sectorStyle)

    const centerHandle = new Feature()
    centerHandle.set('handleId', 'center')

    const rangeHandle = new Feature()
    rangeHandle.set('handleId', 'range')

    const leftHandle = new Feature()
    leftHandle.set('handleId', 'left')

    const rightHandle = new Feature()
    rightHandle.set('handleId', 'right')

    function rebuild() {
      const startBearing = bearing - fovDeg / 2
      const endBearing = bearing + fovDeg / 2

      // Sector polygon
      const coords: number[][] = [fromLonLat([centerLon, centerLat])]
      for (let i = 0; i <= ARC_POINTS; i++) {
        const b = startBearing + (endBearing - startBearing) * (i / ARC_POINTS)
        const [lon, lat] = destinationPoint(centerLat, centerLon, rangeKm, b)
        coords.push(fromLonLat([lon, lat]))
      }
      coords.push(fromLonLat([centerLon, centerLat]))
      sectorFeature.setGeometry(new Polygon([coords]))

      // Handle positions + labels
      centerHandle.setGeometry(new Point(fromLonLat([centerLon, centerLat])))
      centerHandle.setStyle(handleStyle('rgba(255, 255, 255, 0.9)'))

      const [rLon, rLat] = destinationPoint(centerLat, centerLon, rangeKm, bearing)
      rangeHandle.setGeometry(new Point(fromLonLat([rLon, rLat])))
      rangeHandle.setStyle(handleStyle('rgba(0, 255, 100, 0.9)', `${Math.round(rangeKm)} km`))

      const [lLon, lLat] = destinationPoint(centerLat, centerLon, rangeKm, startBearing)
      leftHandle.setGeometry(new Point(fromLonLat([lLon, lLat])))
      leftHandle.setStyle(handleStyle('rgba(255, 200, 0, 0.9)', `${Math.round(fovDeg)}°`))

      const [rrLon, rrLat] = destinationPoint(centerLat, centerLon, rangeKm, endBearing)
      rightHandle.setGeometry(new Point(fromLonLat([rrLon, rrLat])))
      rightHandle.setStyle(handleStyle('rgba(255, 200, 0, 0.9)'))
    }

    rebuild()

    const source = new VectorSource({
      features: [sectorFeature, centerHandle, rangeHandle, leftHandle, rightHandle],
    })
    const layer = new VectorLayer({ source, zIndex: 10 })
    map.addLayer(layer)

    // --- Drag interaction via OL Pointer ---
    let activeHandle: HandleId | null = null

    const interaction = new Pointer({
      handleDownEvent(evt) {
        const hit = map.forEachFeatureAtPixel(evt.pixel, (f) => f, {
          hitTolerance: 10,
        })
        const id = hit?.get('handleId') as HandleId | undefined
        if (id) {
          activeHandle = id
          map.getTargetElement().style.cursor = 'grabbing'
          return true // capture pointer — prevents DragPan
        }
        return false
      },

      handleDragEvent(evt) {
        if (!activeHandle) return
        const [lon, lat] = toLonLat(evt.coordinate)

        if (activeHandle === 'center') {
          centerLon = lon
          centerLat = lat
        } else if (activeHandle === 'range') {
          rangeKm = Math.max(1, haversineDistance(centerLat, centerLon, lat, lon))
        } else if (activeHandle === 'left') {
          const curLeft = normalizeBearing(bearing - fovDeg / 2)
          const newLeft = initialBearing(centerLat, centerLon, lat, lon)
          const delta = angleDiff(curLeft, newLeft)
          const newFov = fovDeg - delta
          if (newFov >= 1 && newFov <= 350) {
            fovDeg = newFov
            bearing = normalizeBearing(bearing + delta / 2)
          }
        } else if (activeHandle === 'right') {
          const curRight = normalizeBearing(bearing + fovDeg / 2)
          const newRight = initialBearing(centerLat, centerLon, lat, lon)
          const delta = angleDiff(curRight, newRight)
          const newFov = fovDeg + delta
          if (newFov >= 1 && newFov <= 350) {
            fovDeg = newFov
            bearing = normalizeBearing(bearing + delta / 2)
          }
        }

        rebuild()
      },

      handleUpEvent() {
        activeHandle = null
        map.getTargetElement().style.cursor = ''
        return false
      },

      handleMoveEvent(evt) {
        if (activeHandle) return
        const hit = map.forEachFeatureAtPixel(evt.pixel, (f) => f, {
          hitTolerance: 10,
        })
        map.getTargetElement().style.cursor = hit?.get('handleId')
          ? 'grab'
          : ''
      },
    })

    map.addInteraction(interaction)

    return () => {
      map.removeInteraction(interaction)
      map.removeLayer(layer)
      map.getTargetElement().style.cursor = ''
    }
  }, [map])

  return null
}
