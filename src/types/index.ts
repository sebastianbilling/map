export interface Place {
  name: string
  distance: string
}

export type LayerFilter = 'all' | 'restaurants' | 'hotels' | 'shops' | 'parks'

export type DistanceUnit = 'km' | 'mi'
