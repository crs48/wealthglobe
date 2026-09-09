export type Confidence = 'official-ubs' | 'databook-estimate' | 'regional-proxy'

export const META = {
  /** Earth's land surface, km² (excluding Antarctica-inclusive figures used by some sources). */
  earthLandKm2: 148_940_000,
  /** Personal wealth covered by the UBS 2026 sample, USD. */
  trackedWealthUsd: 517.69e12,
  /** Share of world personal wealth that the tracked sample represents. */
  sampleCoverage: 0.92,
  /** Number of markets in the UBS Global Wealth Report sample. */
  ubsMarkets: 56,
  wealthVintage: 'UBS Global Wealth Report 2026, end-2025',
  databookVintage: 'UBS Global Wealth Databook 2023, end-2022',
  billionaireVintage: 'Forbes Real-Time Billionaires, September 2026',
  worldPopulation: 8.31e9,
  /** Adults in the UBS 2026 sample (sum of the four tiers). */
  worldAdults: 3.846e9,
  /** World median adult wealth, USD. */
  worldMedianUsd: 8_654,
  worldMedianVintage: 'UBS Global Wealth Report 2024 (end-2023)',
} as const

export const CONFIDENCE_LABEL: Record<Confidence, string> = {
  'official-ubs': 'Official UBS 2026',
  'databook-estimate': 'Databook estimate',
  'regional-proxy': 'Regional proxy',
}

export const CONFIDENCE_HELP: Record<Confidence, string> = {
  'official-ubs': 'Published in the UBS Global Wealth Report 2026 for this market, end-2025 values.',
  'databook-estimate':
    'Country-level estimate from the UBS Global Wealth Databook 2023 (end-2022), rounded. Less precise than the headline markets.',
  'regional-proxy':
    'Not separately surveyed. The figure is borrowed from a neighbouring or governing market and should be read as an order of magnitude only.',
}
