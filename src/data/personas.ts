// Curated "Lives": the people the globe exists to compare. Every card names
// its statistic and its source, and every proxy says so in `proxyNote`.
export type Stat = 'mean' | 'median'

export type PersonaSource =
  | { kind: 'country'; iso3: string; stat: Stat }
  | { kind: 'region'; id: string; stat: Stat }
  | { kind: 'world'; stat: Stat }

export type PersonaGroup = 'africa' | 'asia' | 'americas' | 'gap' | 'world'

export interface Persona {
  id: string
  label: string
  sublabel: string
  source: PersonaSource
  lat: number
  lng: number
  /** Where the camera lands, stated in the card. */
  cameraLabel: string
  /** Shown verbatim when the figure is not a local survey. */
  proxyNote?: string
  group: PersonaGroup
}

export interface PersonaPair {
  id: string
  label: string
  sublabel: string
  a: string
  b: string
  group: PersonaGroup
  lat: number
  lng: number
  cameraLabel: string
}

export const PERSONA_GROUPS: { id: PersonaGroup; label: string }[] = [
  { id: 'africa', label: 'Sub-Saharan Africa' },
  { id: 'asia', label: 'Asia' },
  { id: 'americas', label: 'Latin America & Caribbean' },
  { id: 'gap', label: 'The mean / median gap' },
  { id: 'world', label: 'The whole sample' },
]

export const PERSONAS: Persona[] = [
  // Sub-Saharan Africa and Haiti
  { id: 'haiti-median', label: 'Median adult, Haiti', sublabel: 'The poorest median in the Americas', source: { kind: 'country', iso3: 'HTI', stat: 'median' }, lat: 18.5944, lng: -72.3074, cameraLabel: 'Port-au-Prince', group: 'americas' },
  { id: 'sierra-leone-median', label: 'Median adult, Sierra Leone', sublabel: 'West Africa, coastal', source: { kind: 'country', iso3: 'SLE', stat: 'median' }, lat: 8.4657, lng: -13.2317, cameraLabel: 'Freetown', group: 'africa' },
  { id: 'burundi-median', label: 'Median adult, Burundi', sublabel: 'Great Lakes region', source: { kind: 'country', iso3: 'BDI', stat: 'median' }, lat: -3.4271, lng: 29.9246, cameraLabel: 'Gitega', group: 'africa' },
  {
    id: 'ethiopia-median',
    label: 'Median adult, rural Ethiopia',
    sublabel: 'Four in five Ethiopians live outside cities',
    source: { kind: 'country', iso3: 'ETH', stat: 'median' },
    lat: 11.5936,
    lng: 37.3908,
    cameraLabel: 'Amhara highlands near Bahir Dar',
    proxyNote: 'Rural Ethiopia is not separately measured. This uses the Ethiopia national median adult and lands the camera in the highlands.',
    group: 'africa',
  },
  { id: 'malawi-median', label: 'Median adult, Malawi', sublabel: 'Southern Africa, landlocked', source: { kind: 'country', iso3: 'MWI', stat: 'median' }, lat: -13.9626, lng: 33.7741, cameraLabel: 'Lilongwe', group: 'africa' },
  { id: 'drc-median', label: 'Median adult, DR Congo', sublabel: 'Africa’s second-largest country by land', source: { kind: 'country', iso3: 'COD', stat: 'median' }, lat: -4.4419, lng: 15.2663, cameraLabel: 'Kinshasa', group: 'africa' },
  { id: 'nigeria-median', label: 'Median adult, Nigeria', sublabel: 'Africa’s most populous country', source: { kind: 'country', iso3: 'NGA', stat: 'median' }, lat: 6.5244, lng: 3.3792, cameraLabel: 'Lagos', group: 'africa' },
  { id: 'kenya-median', label: 'Median adult, Kenya', sublabel: 'East Africa’s largest economy', source: { kind: 'country', iso3: 'KEN', stat: 'median' }, lat: -1.2921, lng: 36.8219, cameraLabel: 'Nairobi', group: 'africa' },
  {
    id: 'ssa-mean',
    label: 'Mean adult, Sub-Saharan Africa',
    sublabel: 'Regional average, older databook scale',
    source: { kind: 'region', id: 'r-ssa', stat: 'mean' },
    lat: 2,
    lng: 22,
    cameraLabel: 'Congo Basin, centre of the region',
    proxyNote: 'A regional figure from the Credit Suisse Global Wealth Databook 2023 (end-2022), not a single country’s survey.',
    group: 'africa',
  },
  // Asia
  { id: 'india-median', label: 'Median adult, India', sublabel: 'The world’s most populous country', source: { kind: 'country', iso3: 'IND', stat: 'median' }, lat: 21.1458, lng: 79.0882, cameraLabel: 'Nagpur, central India', group: 'asia' },
  { id: 'indonesia-median', label: 'Median adult, Indonesia', sublabel: 'Camera lands on Bali', source: { kind: 'country', iso3: 'IDN', stat: 'median' }, lat: -8.6705, lng: 115.2126, cameraLabel: 'Denpasar, Bali', group: 'asia' },
  { id: 'indonesia-mean', label: 'Mean adult, Indonesia', sublabel: 'Camera lands on Jakarta', source: { kind: 'country', iso3: 'IDN', stat: 'mean' }, lat: -6.2088, lng: 106.8456, cameraLabel: 'Jakarta', group: 'asia' },
  { id: 'china-median', label: 'Median adult, China', sublabel: 'Camera lands on a central city', source: { kind: 'country', iso3: 'CHN', stat: 'median' }, lat: 30.5928, lng: 114.3055, cameraLabel: 'Wuhan', group: 'asia' },
  {
    id: 'tibet',
    label: 'Someone in Tibet',
    sublabel: 'China median, camera on Lhasa',
    source: { kind: 'country', iso3: 'CHN', stat: 'median' },
    lat: 29.652,
    lng: 91.1721,
    cameraLabel: 'Lhasa',
    proxyNote: 'Tibet is not separately measured; this uses the China median adult and lands the camera on Lhasa.',
    group: 'asia',
  },
  {
    id: 'bali',
    label: 'Someone in Bali',
    sublabel: 'Indonesia median, camera on Denpasar',
    source: { kind: 'country', iso3: 'IDN', stat: 'median' },
    lat: -8.6705,
    lng: 115.2126,
    cameraLabel: 'Denpasar',
    proxyNote: 'Bali is not separately measured; this uses the Indonesia median adult and lands the camera on Denpasar.',
    group: 'asia',
  },
  // Latin America
  { id: 'brazil-median', label: 'Median adult, Brazil', sublabel: 'South America’s largest economy', source: { kind: 'country', iso3: 'BRA', stat: 'median' }, lat: -23.5505, lng: -46.6333, cameraLabel: 'São Paulo', group: 'americas' },
  { id: 'mexico-median', label: 'Median adult, Mexico', sublabel: 'North America’s second most populous country', source: { kind: 'country', iso3: 'MEX', stat: 'median' }, lat: 19.4326, lng: -99.1332, cameraLabel: 'Mexico City', group: 'americas' },
  // Mean / median gap pairs
  { id: 'germany-median', label: 'Median German adult', sublabel: 'Typical person', source: { kind: 'country', iso3: 'DEU', stat: 'median' }, lat: 52.52, lng: 13.405, cameraLabel: 'Berlin', group: 'gap' },
  { id: 'germany-mean', label: 'Mean German adult', sublabel: 'Average person', source: { kind: 'country', iso3: 'DEU', stat: 'mean' }, lat: 52.52, lng: 13.405, cameraLabel: 'Berlin', group: 'gap' },
  { id: 'usa-median', label: 'Median American adult', sublabel: 'Typical person', source: { kind: 'country', iso3: 'USA', stat: 'median' }, lat: 39.0997, lng: -94.5786, cameraLabel: 'Kansas City', group: 'gap' },
  { id: 'usa-mean', label: 'Mean American adult', sublabel: 'Average person', source: { kind: 'country', iso3: 'USA', stat: 'mean' }, lat: 39.0997, lng: -94.5786, cameraLabel: 'Kansas City', group: 'gap' },
  { id: 'switzerland-median', label: 'Median Swiss adult', sublabel: 'Typical person', source: { kind: 'country', iso3: 'CHE', stat: 'median' }, lat: 47.3769, lng: 8.5417, cameraLabel: 'Zürich', group: 'gap' },
  { id: 'switzerland-mean', label: 'Mean Swiss adult', sublabel: 'Average person', source: { kind: 'country', iso3: 'CHE', stat: 'mean' }, lat: 47.3769, lng: 8.5417, cameraLabel: 'Zürich', group: 'gap' },
  // World
  {
    id: 'world-median',
    label: 'Median adult, world',
    sublabel: 'Half of adults hold less than this',
    source: { kind: 'world', stat: 'median' },
    lat: 25,
    lng: 75,
    cameraLabel: 'Near the world’s population centre',
    proxyNote: 'World median from the UBS Global Wealth Report 2024 (end-2023); the 2026 report does not restate it.',
    group: 'world',
  },
  {
    id: 'world-mean',
    label: 'Mean adult, world sample',
    sublabel: 'Tracked wealth divided by tracked adults',
    source: { kind: 'world', stat: 'mean' },
    lat: 25,
    lng: 75,
    cameraLabel: 'Near the world’s population centre',
    group: 'world',
  },
]

export const PERSONA_PAIRS: PersonaPair[] = [
  { id: 'germany-pair', label: 'Germany: median vs mean', sublabel: 'A 6.5× gap, the widest among rich countries', a: 'germany-median', b: 'germany-mean', group: 'gap', lat: 52.52, lng: 13.405, cameraLabel: 'Berlin' },
  { id: 'usa-pair', label: 'United States: median vs mean', sublabel: 'A 10× gap', a: 'usa-median', b: 'usa-mean', group: 'gap', lat: 39.0997, lng: -94.5786, cameraLabel: 'Kansas City' },
  { id: 'switzerland-pair', label: 'Switzerland: median vs mean', sublabel: 'The richest mean, a 6.3× gap', a: 'switzerland-median', b: 'switzerland-mean', group: 'gap', lat: 47.3769, lng: 8.5417, cameraLabel: 'Zürich' },
]

export const PERSONA_BY_ID: ReadonlyMap<string, Persona> = new Map(PERSONAS.map((p) => [p.id, p]))
export const PERSONA_PAIR_BY_ID: ReadonlyMap<string, PersonaPair> = new Map(PERSONA_PAIRS.map((p) => [p.id, p]))
