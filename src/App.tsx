import { useLayerSettings, useMapSettings } from './hooks/useMapSettings'
import { useTheme } from './hooks/useTheme'
import { BottomBar } from './components/BottomBar/BottomBar'
import { Header } from './components/Header/Header'
import { LayersPanel } from './components/LayersPanel/LayersPanel'
import { Map } from './components/Map/Map'
import { PlaneLayer } from './components/Map/PlaneLayer'
import { SectorLayer } from './components/Map/SectorLayer'
import { SettingsPanel } from './components/SettingsPanel/SettingsPanel'
import { Sidebar } from './components/Sidebar/Sidebar'
import './App.css'

function App() {
  const mapSettings = useMapSettings()
  const layerSettings = useLayerSettings()
  //const { theme, setTheme } = useTheme()

  const panels = [
    {
      id: 'settings',
      icon: '⚙',
      title: 'Settings',
      content: <SettingsPanel settings={mapSettings} />,
    },
    {
      id: 'layers',
      icon: '◉',
      title: 'Layers',
      content: <LayersPanel settings={layerSettings} />,
    },
  ]

  return (
    <div className="app">
      {/* <Header theme={theme} onThemeChange={setTheme} /> */}
      <div className="app-body">
        {/* <Sidebar panels={panels} /> */ }
        <Map opacity={mapSettings.mapOpacity / 100}>
          <PlaneLayer />
          <SectorLayer />
        </Map>
      </div>
      {/* <BottomBar text="Tracking 100 aircraft — Last updated just now" /> */ }
    </div>
  )
}

export default App
