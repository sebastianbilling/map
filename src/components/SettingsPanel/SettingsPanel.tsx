import type { MapSettings } from '../../hooks/useMapSettings'
import { Section } from '../ui/Section'
import { SelectRow } from '../ui/SelectRow'
import { SliderRow } from '../ui/SliderRow'
import { Toggle } from '../ui/Toggle'

interface SettingsPanelProps {
  settings: MapSettings
}

export function SettingsPanel({ settings }: SettingsPanelProps) {
  return (
    <>
      <Section title="Map3">
        <Toggle label="Show labels" checked={settings.showLabels} onChange={() => settings.setShowLabels(!settings.showLabels)} />
        <Toggle label="Traffic layer" checked={settings.showTraffic} onChange={() => settings.setShowTraffic(!settings.showTraffic)} />
        <Toggle label="3D buildings" checked={settings.show3D} onChange={() => settings.setShow3D(!settings.show3D)} />
        <Toggle label="Satellite view" checked={settings.showSatellite} onChange={() => settings.setShowSatellite(!settings.showSatellite)} />
      </Section>

      <Section title="Markers">
        <Toggle label="Cluster nearby" checked={settings.clusterMarkers} onChange={() => settings.setClusterMarkers(!settings.clusterMarkers)} />
        <Toggle label="Auto-zoom to fit" checked={settings.autoZoom} onChange={() => settings.setAutoZoom(!settings.autoZoom)} />
      </Section>

      <Section title="Display">
        <SliderRow label="Map opacity" min={0} max={100} value={settings.mapOpacity} onChange={settings.setMapOpacity} />
        <SelectRow
          label="Distance unit"
          value={settings.unit}
          options={[
            { value: 'km', label: 'Kilometers' },
            { value: 'mi', label: 'Miles' },
          ]}
          onChange={(v) => settings.setUnit(v as 'km' | 'mi')}
        />
      </Section>
    </>
  )
}
