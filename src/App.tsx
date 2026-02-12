import { useLayerSettings, useMapSettings } from './hooks/useMapSettings'
import { LayersPanel } from './components/LayersPanel/LayersPanel'
import { Map } from './components/Map/Map'
import { PlaneLayer } from './components/Map/PlaneLayer'
import { SettingsPanel } from './components/SettingsPanel/SettingsPanel'
import { Sidebar } from './components/Sidebar/Sidebar'
import './App.css'

function App() {
  const mapSettings = useMapSettings()
  const layerSettings = useLayerSettings()

  return (
    <div className="app">
      <Sidebar side="left" title="Settings">
        <SettingsPanel settings={mapSettings} />
      </Sidebar>
      <Sidebar side="right" title="Layers">
        <LayersPanel settings={layerSettings} />
      </Sidebar>
      <Map>
        <PlaneLayer />
      </Map>
    </div>
  )
}

export default App
