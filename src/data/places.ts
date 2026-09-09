// Named fly-to points that are not countries. `persona` links a place to the
// Lives card that uses it, so searching "Bali" lands on the Indonesia median.
export interface Place {
  id: string
  label: string
  lat: number
  lng: number
  iso3: string
  persona?: string
}

export const PLACES: Place[] = [
  { id: 'bali', label: 'Bali', lat: -8.4095, lng: 115.1889, iso3: 'IDN', persona: 'indonesia-median' },
  { id: 'denpasar', label: 'Denpasar', lat: -8.6705, lng: 115.2126, iso3: 'IDN', persona: 'indonesia-median' },
  { id: 'jakarta', label: 'Jakarta', lat: -6.2088, lng: 106.8456, iso3: 'IDN', persona: 'indonesia-mean' },
  { id: 'lhasa', label: 'Lhasa, Tibet', lat: 29.652, lng: 91.1721, iso3: 'CHN', persona: 'tibet' },
  { id: 'wuhan', label: 'Wuhan', lat: 30.5928, lng: 114.3055, iso3: 'CHN', persona: 'china-median' },
  { id: 'lagos', label: 'Lagos', lat: 6.5244, lng: 3.3792, iso3: 'NGA', persona: 'nigeria-median' },
  { id: 'nairobi', label: 'Nairobi', lat: -1.2921, lng: 36.8219, iso3: 'KEN', persona: 'kenya-median' },
  { id: 'addis', label: 'Addis Ababa', lat: 9.03, lng: 38.74, iso3: 'ETH', persona: 'ethiopia-median' },
  { id: 'kinshasa', label: 'Kinshasa', lat: -4.4419, lng: 15.2663, iso3: 'COD', persona: 'drc-median' },
  { id: 'port-au-prince', label: 'Port-au-Prince', lat: 18.5944, lng: -72.3074, iso3: 'HTI', persona: 'haiti-median' },
  { id: 'freetown', label: 'Freetown', lat: 8.4657, lng: -13.2317, iso3: 'SLE', persona: 'sierra-leone-median' },
  { id: 'gitega', label: 'Gitega', lat: -3.4271, lng: 29.9246, iso3: 'BDI', persona: 'burundi-median' },
  { id: 'lilongwe', label: 'Lilongwe', lat: -13.9626, lng: 33.7741, iso3: 'MWI', persona: 'malawi-median' },
  { id: 'mumbai', label: 'Mumbai', lat: 19.076, lng: 72.8777, iso3: 'IND', persona: 'india-median' },
  { id: 'sao-paulo', label: 'São Paulo', lat: -23.5505, lng: -46.6333, iso3: 'BRA', persona: 'brazil-median' },
  { id: 'mexico-city', label: 'Mexico City', lat: 19.4326, lng: -99.1332, iso3: 'MEX', persona: 'mexico-median' },
  { id: 'berlin', label: 'Berlin', lat: 52.52, lng: 13.405, iso3: 'DEU', persona: 'germany-pair' },
  { id: 'kansas-city', label: 'Kansas City', lat: 39.0997, lng: -94.5786, iso3: 'USA', persona: 'usa-pair' },
  { id: 'zurich', label: 'Zürich', lat: 47.3769, lng: 8.5417, iso3: 'CHE', persona: 'switzerland-pair' },
  { id: 'london', label: 'London', lat: 51.5074, lng: -0.1278, iso3: 'GBR' },
  { id: 'new-york', label: 'New York', lat: 40.7128, lng: -74.006, iso3: 'USA' },
  { id: 'tokyo', label: 'Tokyo', lat: 35.6762, lng: 139.6503, iso3: 'JPN' },
  { id: 'sydney', label: 'Sydney', lat: -33.8688, lng: 151.2093, iso3: 'AUS' },
  { id: 'johannesburg', label: 'Johannesburg', lat: -26.2041, lng: 28.0473, iso3: 'ZAF' },
  { id: 'cairo', label: 'Cairo', lat: 30.0444, lng: 31.2357, iso3: 'EGY' },
]

export const PLACE_BY_ID: ReadonlyMap<string, Place> = new Map(PLACES.map((p) => [p.id, p]))
