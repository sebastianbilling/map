import { useState } from 'react'
import type { DistanceUnit, LayerFilter } from '../types'

export function useMapSettings() {
  const [showLabels, setShowLabels] = useState(true)
  const [showTraffic, setShowTraffic] = useState(false)
  const [show3D, setShow3D] = useState(false)
  const [showSatellite, setShowSatellite] = useState(false)
  const [clusterMarkers, setClusterMarkers] = useState(true)
  const [autoZoom, setAutoZoom] = useState(true)
  const [mapOpacity, setMapOpacity] = useState(80)
  const [unit, setUnit] = useState<DistanceUnit>('km')

  return {
    showLabels, setShowLabels,
    showTraffic, setShowTraffic,
    show3D, setShow3D,
    showSatellite, setShowSatellite,
    clusterMarkers, setClusterMarkers,
    autoZoom, setAutoZoom,
    mapOpacity, setMapOpacity,
    unit, setUnit,
  }
}

export function useLayerSettings() {
  const [notifications, setNotifications] = useState(true)
  const [liveUpdates, setLiveUpdates] = useState(true)
  const [soundAlerts, setSoundAlerts] = useState(false)
  const [selectedLayer, setSelectedLayer] = useState<LayerFilter>('all')

  return {
    notifications, setNotifications,
    liveUpdates, setLiveUpdates,
    soundAlerts, setSoundAlerts,
    selectedLayer, setSelectedLayer,
  }
}

export type MapSettings = ReturnType<typeof useMapSettings>
export type LayerSettings = ReturnType<typeof useLayerSettings>
