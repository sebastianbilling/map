import type { LayerSettings } from '../../hooks/useMapSettings'
import type { LayerFilter, Place } from '../../types'
import { PlaceList } from '../ui/PlaceList'
import { RadioPills } from '../ui/RadioPills'
import { Section } from '../ui/Section'
import { Toggle } from '../ui/Toggle'

const LAYER_OPTIONS: LayerFilter[] = ['all', 'restaurants', 'hotels', 'shops', 'parks']

const NEARBY_PLACES: Place[] = [
  { name: 'The Grand Hotel', distance: '0.3 km' },
  { name: 'Riverside Cafe', distance: '0.5 km' },
  { name: 'Central Park', distance: '0.8 km' },
  { name: 'City Library', distance: '1.2 km' },
  { name: 'Market Square', distance: '1.5 km' },
]

interface LayersPanelProps {
  settings: LayerSettings
}

export function LayersPanel({ settings }: LayersPanelProps) {
  return (
    <>
      <Section title="Filter">
        <RadioPills options={LAYER_OPTIONS} value={settings.selectedLayer} onChange={settings.setSelectedLayer} />
      </Section>

      <Section title="Alerts">
        <Toggle label="Notifications" checked={settings.notifications} onChange={() => settings.setNotifications(!settings.notifications)} />
        <Toggle label="Live updates" checked={settings.liveUpdates} onChange={() => settings.setLiveUpdates(!settings.liveUpdates)} />
        <Toggle label="Sound alerts" checked={settings.soundAlerts} onChange={() => settings.setSoundAlerts(!settings.soundAlerts)} />
      </Section>

      <Section title="Nearby">
        <PlaceList places={NEARBY_PLACES} />
      </Section>
    </>
  )
}
