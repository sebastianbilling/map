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
  opacity?: number
}

export function Map({ children, opacity = 1 }: MapProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [map, setMap] = useState<OLMap | null>(null)
  const tileLayerRef = useRef<TileLayer<XYZ> | null>(null)

  useEffect(() => {
    if (!containerRef.current) return

    const tileLayer = new TileLayer({
      source: new XYZ({
        //url: '/tiles/{z}/{x}/{y}.png',
          url: 'https://{a-d}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
      attributions: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>',
      }),
      opacity,
    })
    tileLayerRef.current = tileLayer

    const olMap = new OLMap({
      target: containerRef.current,
      layers: [tileLayer],
      view: new View({
        center: fromLonLat([11.97, 57.7]),
        zoom: 13,
      }),
    })

    setMap(olMap)

    return () => {
      olMap.setTarget(undefined)
      setMap(null)
    }
  }, [])

  useEffect(() => {
    tileLayerRef.current?.setOpacity(opacity)
  }, [opacity])

  return (
    <>
      <div ref={containerRef} className="map" />
      {map && <MapProvider value={map}>{children}</MapProvider>}
    </>
  )
}
