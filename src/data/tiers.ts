// The UBS 2026 wealth pyramid. Shares of adults and of wealth in the
// tracked sample; the land share follows the wealth share by construction.
export interface Tier {
  id: string
  label: string
  range: string
  adults: number
  adultShare: number
  wealthShare: number
  color: string
  /** Wealth per adult that sits at the tier's midpoint (for a representative claim). */
  typicalUsd: number
}

export const TIERS: Tier[] = [
  { id: 'millionaires', label: 'Millionaires', range: '≥ $1M', adults: 58e6, adultShare: 0.015, wealthShare: 0.484, color: '#e2b74a', typicalUsd: 4.3e6 },
  { id: 'upper', label: 'Upper middle', range: '$100k – $1M', adults: 588e6, adultShare: 0.153, wealthShare: 0.388, color: '#5ec27a', typicalUsd: 342_000 },
  { id: 'middle', label: 'Lower middle', range: '$10k – $100k', adults: 1.58e9, adultShare: 0.411, wealthShare: 0.122, color: '#4a8de2', typicalUsd: 40_000 },
  { id: 'base', label: 'Base', range: '< $10k', adults: 1.62e9, adultShare: 0.421, wealthShare: 0.006, color: '#7b8aa3', typicalUsd: 1_900 },
]

export const TIER_BY_ID: ReadonlyMap<string, Tier> = new Map(TIERS.map((t) => [t.id, t]))
