import { useEffect } from 'preact/hooks'
import VectorLayer from 'ol/layer/Vector'
import VectorSource from 'ol/source/Vector'
import { fromLonLat } from 'ol/proj'
import { Feature } from 'ol'
import { LineString, Point } from 'ol/geom'
import { Stroke, Style, Circle as CircleStyle, Fill } from 'ol/style'

import { useOLMap } from './MapContext'
import { usePlaneConfigs, computePosition } from '../../hooks/usePlaneSimulator'

const TRAIL_SECONDS = 20
const TRAIL_SAMPLES = 20

function hslToRgba(h: number, s: number, l: number, a: number): string {
  const c = (1 - Math.abs(2 * l - 1)) * s
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1))
  const m = l - c / 2
  let r = 0, g = 0, b = 0
  if (h < 60) { r = c; g = x }
  else if (h < 120) { r = x; g = c }
  else if (h < 180) { g = c; b = x }
  else if (h < 240) { g = x; b = c }
  else if (h < 300) { r = x; b = c }
  else { r = c; b = x }
  return `rgba(${Math.round((r + m) * 255)},${Math.round((g + m) * 255)},${Math.round((b + m) * 255)},${a})`
}

export function PlaneLayer() {
  const map = useOLMap()
  const configs = usePlaneConfigs()

  useEffect(() => {
    const source = new VectorSource()
    const layer = new VectorLayer({ source })
    map.addLayer(layer)

    const startTime = performance.now()
    let rafId: number

    const trailStyles = configs.map(cfg => {
      const styles: Style[] = []
      for (let s = 0; s < TRAIL_SAMPLES; s++) {
        const opacity = Math.max(0.05, (s + 1) / TRAIL_SAMPLES)
        styles.push(
          new Style({
            stroke: new Stroke({
              color: hslToRgba(cfg.hue, 0.9, 0.55, opacity),
              width: 1 + 2 * opacity,
            }),
          })
        )
      }
      return styles
    })

    const markerStyles = configs.map(cfg =>
      new Style({
        image: new CircleStyle({
          radius: 4,
          fill: new Fill({ color: hslToRgba(cfg.hue, 0.9, 0.55, 1) }),
          stroke: new Stroke({ color: '#ffffff', width: 1.5 }),
        }),
      })
    )

    const featuresPerPlane = TRAIL_SAMPLES + 1
    const allFeatures: Feature[] = []
    for (let p = 0; p < configs.length; p++) {
      for (let s = 0; s < TRAIL_SAMPLES; s++) {
        const f = new Feature({ geometry: new LineString([[0, 0], [0, 0]]) })
        f.setStyle(trailStyles[p][s])
        allFeatures.push(f)
      }
      const m = new Feature({ geometry: new Point([0, 0]) })
      m.setStyle(markerStyles[p])
      allFeatures.push(m)
    }
    source.addFeatures(allFeatures)

    const loop = (now: number) => {
      const elapsed = (now - startTime) / 1000

      for (let p = 0; p < configs.length; p++) {
        const cfg = configs[p]
        const baseIdx = p * featuresPerPlane

        let prevCoord = fromLonLat((() => {
          const pos = computePosition(cfg, elapsed - TRAIL_SECONDS)
          return [pos.lon, pos.lat] as [number, number]
        })())

        for (let s = 0; s < TRAIL_SAMPLES; s++) {
          const t = elapsed - TRAIL_SECONDS + (s + 1) * (TRAIL_SECONDS / TRAIL_SAMPLES)
          const pos = computePosition(cfg, t)
          const coord = fromLonLat([pos.lon, pos.lat])
          const geom = allFeatures[baseIdx + s].getGeometry() as LineString
          geom.setCoordinates([prevCoord, coord])
          prevCoord = coord
        }

        const cur = computePosition(cfg, elapsed)
        const markerGeom = allFeatures[baseIdx + TRAIL_SAMPLES].getGeometry() as Point
        markerGeom.setCoordinates(fromLonLat([cur.lon, cur.lat]))
      }

      rafId = requestAnimationFrame(loop)
    }

    rafId = requestAnimationFrame(loop)

    return () => {
      cancelAnimationFrame(rafId)
      map.removeLayer(layer)
    }
  }, [map, configs])

  return null
}
