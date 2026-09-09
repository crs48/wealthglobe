// Forbes Real-Time Billionaires snapshot, September 2026. These numbers move
// daily; treat them as a dated reading, not a fact about today.
export interface Person {
  id: string
  name: string
  role: string
  wealthUsd: number
  lat: number
  lng: number
  place: string
  iso3: string
  color: string
}

export const PEOPLE: Person[] = [
  { id: 'musk', name: 'Elon Musk', role: 'Tesla, SpaceX, xAI', wealthUsd: 908.2e9, lat: 30.2672, lng: -97.7431, place: 'Austin, Texas', iso3: 'USA', color: '#e2b74a' },
  { id: 'page', name: 'Larry Page', role: 'Google co-founder', wealthUsd: 277.9e9, lat: 37.3861, lng: -122.0839, place: 'Mountain View, California', iso3: 'USA', color: '#e2b74a' },
  { id: 'bezos', name: 'Jeff Bezos', role: 'Amazon founder', wealthUsd: 266.5e9, lat: 25.7617, lng: -80.1918, place: 'Miami, Florida', iso3: 'USA', color: '#e2b74a' },
  { id: 'dell', name: 'Michael Dell', role: 'Dell Technologies', wealthUsd: 263.1e9, lat: 30.2672, lng: -97.7431, place: 'Austin, Texas', iso3: 'USA', color: '#e2b74a' },
  { id: 'brin', name: 'Sergey Brin', role: 'Google co-founder', wealthUsd: 255.7e9, lat: 37.3852, lng: -122.1141, place: 'Los Altos, California', iso3: 'USA', color: '#e2b74a' },
  { id: 'zuckerberg', name: 'Mark Zuckerberg', role: 'Meta', wealthUsd: 197e9, lat: 37.4419, lng: -122.143, place: 'Palo Alto, California', iso3: 'USA', color: '#e2b74a' },
  { id: 'ellison', name: 'Larry Ellison', role: 'Oracle', wealthUsd: 193e9, lat: 20.8283, lng: -156.9197, place: 'Lanaʻi, Hawaii', iso3: 'USA', color: '#e2b74a' },
  { id: 'huang', name: 'Jensen Huang', role: 'Nvidia', wealthUsd: 191e9, lat: 37.3852, lng: -122.1141, place: 'Los Altos, California', iso3: 'USA', color: '#e2b74a' },
  { id: 'ballmer', name: 'Steve Ballmer', role: 'Former Microsoft CEO', wealthUsd: 155e9, lat: 47.6062, lng: -122.3321, place: 'Seattle, Washington', iso3: 'USA', color: '#e2b74a' },
  { id: 'ortega', name: 'Amancio Ortega', role: 'Inditex (Zara)', wealthUsd: 148e9, lat: 43.3623, lng: -8.4115, place: 'A Coruña, Spain', iso3: 'ESP', color: '#e2b74a' },
  { id: 'arnault', name: 'Bernard Arnault', role: 'LVMH', wealthUsd: 130e9, lat: 48.8566, lng: 2.3522, place: 'Paris, France', iso3: 'FRA', color: '#e2b74a' },
  { id: 'gates', name: 'Bill Gates', role: 'Microsoft co-founder', wealthUsd: 108e9, lat: 47.6209, lng: -122.2268, place: 'Medina, Washington', iso3: 'USA', color: '#e2b74a' },
]

export const PERSON_BY_ID: ReadonlyMap<string, Person> = new Map(PEOPLE.map((p) => [p.id, p]))
