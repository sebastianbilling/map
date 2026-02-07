import 'ol/ol.css'
import './Map.css'

import { useEffect, useRef } from 'react'
import OLMap from 'ol/Map'
import View from 'ol/View'
import TileLayer from 'ol/layer/Tile'
import VectorLayer from 'ol/layer/Vector'
import VectorSource from 'ol/source/Vector'
import XYZ from 'ol/source/XYZ'
import { fromLonLat } from 'ol/proj'
import { Feature } from 'ol'
import { LineString, Point } from 'ol/geom'
import { Stroke, Style, Circle as CircleStyle, Fill } from 'ol/style'

import { usePlaneSimulator } from '../../hooks/usePlaneSimulator'

export function Map() {
  const mapRef = useRef<HTMLDivElement>(null)
  const olMapRef = useRef<OLMap | null>(null)
  const vectorSourceRef = useRef(new VectorSource())

  const trail = usePlaneSimulator()

  // Initialize OL map once
  useEffect(() => {
    if (!mapRef.current || olMapRef.current) return

    const map = new OLMap({
      target: mapRef.current,
      layers: [
        new TileLayer({
          source: new XYZ({
            url: 'https://{a-d}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
            attributions:
              '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>',
          }),
        }),
        new VectorLayer({
          source: vectorSourceRef.current,
        }),
      ],
      view: new View({
        center: fromLonLat([-0.09, 51.505]),
        zoom: 13,
      }),
    })

    olMapRef.current = map

    return () => {
      map.setTarget(undefined)
      olMapRef.current = null
    }
  }, [])

  // Update trail + plane marker on each tick
  useEffect(() => {
    const source = vectorSourceRef.current
    source.clear()

    if (trail.length < 2) return

    const now = trail[trail.length - 1].timestamp
    const trailDuration = 20_000

    // Draw individual line segments with fading opacity
    for (let i = 1; i < trail.length; i++) {
      const prev = trail[i - 1]
      const curr = trail[i]
      const age = now - curr.timestamp
      const opacity = Math.max(0.05, 1 - age / trailDuration)
      const width = 1 + 2 * opacity

      const segment = new Feature({
        geometry: new LineString([
          fromLonLat([prev.lon, prev.lat]),
          fromLonLat([curr.lon, curr.lat]),
        ]),
      })

      segment.setStyle(
        new Style({
          stroke: new Stroke({
            color: `rgba(0, 180, 255, ${opacity})`,
            width,
          }),
        })
      )

      source.addFeature(segment)
    }

    // Plane marker at current position
    const current = trail[trail.length - 1]
    const planeFeature = new Feature({
      geometry: new Point(fromLonLat([current.lon, current.lat])),
    })

    planeFeature.setStyle(
      new Style({
        image: new CircleStyle({
          radius: 6,
          fill: new Fill({ color: '#00b4ff' }),
          stroke: new Stroke({ color: '#ffffff', width: 2 }),
        }),
      })
    )

    source.addFeature(planeFeature)
  }, [trail])

  return <div ref={mapRef} className="map" />
}
