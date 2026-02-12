import 'ol/ol.css'
import './Map.css'

import { useEffect, useRef, useState } from 'preact/hooks'
import type { ComponentChildren } from 'preact'
import OLMap from 'ol/Map'
import View from 'ol/View'
import TileLayer from 'ol/layer/Tile'
import XYZ from 'ol/source/XYZ'
import { fromLonLat } from 'ol/proj'
import { MapProvider } from './MapContext'

interface MapProps {
  children?: ComponentChildren
}

export function Map({ children }: MapProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [map, setMap] = useState<OLMap | null>(null)

  useEffect(() => {
    if (!containerRef.current) return

    const olMap = new OLMap({
      target: containerRef.current,
      layers: [
        new TileLayer({
          source: new XYZ({
            url: 'https://{a-d}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
            attributions:
              '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>',
          }),
        }),
      ],
      view: new View({
        center: fromLonLat([-0.09, 51.505]),
        zoom: 13,
      }),
    })

    setMap(olMap)

    return () => {
      olMap.setTarget(undefined)
      setMap(null)
    }
  }, [])

  return (
    <>
      <div ref={containerRef} className="map" />
      {map && <MapProvider value={map}>{children}</MapProvider>}
    </>
  )
}
