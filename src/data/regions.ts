import type { RegionId } from './countries'

export interface RegionGroup {
  id: RegionId
  label: string
  /** Display order in the Places list. Poor regions are not buried. */
  order: number
}

export const REGION_GROUPS: RegionGroup[] = [
  { id: 'sub-saharan-africa', label: 'Sub-Saharan Africa', order: 0 },
  { id: 'south-asia', label: 'South Asia', order: 1 },
  { id: 'southeast-asia', label: 'Southeast Asia', order: 2 },
  { id: 'latin-america', label: 'Latin America & Caribbean', order: 3 },
  { id: 'north-africa', label: 'North Africa', order: 4 },
  { id: 'middle-east', label: 'Middle East & Central Asia', order: 5 },
  { id: 'east-asia', label: 'East Asia', order: 6 },
  { id: 'europe', label: 'Europe', order: 7 },
  { id: 'oceania', label: 'Oceania', order: 8 },
  { id: 'north-america', label: 'North America', order: 9 },
]

export const REGION_LABEL: Record<RegionId, string> = Object.fromEntries(
  REGION_GROUPS.map((g) => [g.id, g.label]),
) as Record<RegionId, string>

/** Regional means, USD per adult, UBS Global Wealth Report 2026 sample. */
export interface RegionalMean {
  id: string
  label: string
  mean: number
  median?: number
  vintage: string
  lat: number
  lng: number
}

export const REGIONAL_MEANS: RegionalMean[] = [
  { id: 'r-usa', label: 'United States', mean: 696_277, vintage: 'UBS 2026', lat: 39.8, lng: -98.6 },
  { id: 'r-anz', label: 'Australia & New Zealand', mean: 589_000, vintage: 'UBS 2026 (approx.)', lat: -27, lng: 140 },
  { id: 'r-weu', label: 'Western Europe', mean: 337_083, vintage: 'UBS 2026', lat: 48, lng: 8 },
  { id: 'r-mea', label: 'Middle East & Africa', mean: 85_000, vintage: 'UBS 2026 (approx.)', lat: 20, lng: 35 },
  { id: 'r-chn', label: 'Greater China', mean: 85_301, vintage: 'UBS 2026', lat: 35, lng: 105 },
  { id: 'r-eeu', label: 'Eastern Europe', mean: 62_122, vintage: 'UBS 2026', lat: 52, lng: 30 },
  { id: 'r-lat', label: 'Latin America', mean: 42_924, vintage: 'UBS 2026', lat: -10, lng: -60 },
  { id: 'r-sea', label: 'Southeast Asia', mean: 42_797, vintage: 'UBS 2026', lat: 5, lng: 110 },
  {
    id: 'r-ssa',
    label: 'Sub-Saharan Africa',
    mean: 8_300,
    median: 1_200,
    vintage: 'Credit Suisse Global Wealth Databook 2023 (end-2022), Africa',
    lat: 2,
    lng: 22,
  },
]

export const REGIONAL_MEAN_BY_ID: ReadonlyMap<string, RegionalMean> = new Map(REGIONAL_MEANS.map((r) => [r.id, r]))
