import { META } from '../data/meta'
import { LAND_REFS_SORTED, type LandRef } from '../data/landRefs'
import { COUNTRIES, type Country } from '../data/countries'

export const EARTH_LAND_KM2 = META.earthLandKm2
export const TRACKED_WEALTH_USD = META.trackedWealthUsd

/** The allocation rule. Area, not value: Manhattan and the Sahara count the same. */
export function landClaimKm2(netWorthUsd: number): number {
  return (netWorthUsd / TRACKED_WEALTH_USD) * EARTH_LAND_KM2
}

/** Inverse: the net worth that would claim a given area. */
export function netWorthForKm2(km2: number): number {
  return (km2 / EARTH_LAND_KM2) * TRACKED_WEALTH_USD
}

export function landShare(km2: number): number {
  return km2 / EARTH_LAND_KM2
}

export function circleRadiusKm(km2: number): number {
  return Math.sqrt(km2 / Math.PI)
}

export function squareSideM(km2: number): number {
  return Math.sqrt(km2 * 1e6)
}

export interface AreaBreakdown {
  km2: number
  hectares: number
  m2: number
}

export function areaBreakdown(km2: number): AreaBreakdown {
  return { km2, hectares: km2 * 100, m2: km2 * 1e6 }
}

// ---------- formatting ----------

const nf0 = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 })
const nf1 = new Intl.NumberFormat('en-US', { maximumFractionDigits: 1 })
const nf2 = new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 })

function sig(n: number, digits = 3): string {
  if (n === 0) return '0'
  const mag = Math.floor(Math.log10(Math.abs(n)))
  const decimals = Math.max(0, digits - 1 - mag)
  return new Intl.NumberFormat('en-US', { maximumFractionDigits: decimals }).format(n)
}

/** Primary area string in the most readable unit. */
export function formatArea(km2: number): string {
  if (km2 >= 1_000_000) return `${nf1.format(km2 / 1_000_000)} million km²`
  if (km2 >= 100) return `${nf0.format(km2)} km²`
  if (km2 >= 1) return `${nf2.format(km2)} km²`
  const ha = km2 * 100
  if (ha >= 1) return `${sig(ha, 3)} ha`
  const m2 = km2 * 1e6
  if (m2 >= 1) return `${sig(m2, 3)} m²`
  return `${sig(m2 * 1e4, 3)} cm²`
}

/** Value and unit split for typography: "1.5 million" + "km²". */
export function formatAreaParts(km2: number): { value: string; unit: string } {
  const s = formatArea(km2)
  const i = s.lastIndexOf(' ')
  return { value: s.slice(0, i), unit: s.slice(i + 1) }
}

/** The unit-split form used under the big number. */
export function formatAreaTriple(km2: number): { km2: string; ha: string; m2: string } {
  return {
    km2: km2 >= 1000 ? nf0.format(km2) : sig(km2, 3),
    ha: km2 * 100 >= 1000 ? nf0.format(km2 * 100) : sig(km2 * 100, 3),
    m2: km2 * 1e6 >= 1000 ? nf0.format(km2 * 1e6) : sig(km2 * 1e6, 3),
  }
}

export function formatDistance(km: number): string {
  if (km >= 100) return `${nf0.format(km)} km`
  if (km >= 1) return `${nf1.format(km)} km`
  const m = km * 1000
  if (m >= 1) return `${sig(m, 3)} m`
  return `${sig(m * 100, 2)} cm`
}

export function formatUsd(n: number, opts: { compact?: boolean } = {}): string {
  if (opts.compact || n >= 1e9) {
    if (n >= 1e12) return `$${sig(n / 1e12, 3)}T`
    if (n >= 1e9) return `$${sig(n / 1e9, 3)}B`
    if (n >= 1e6) return `$${sig(n / 1e6, 3)}M`
    if (n >= 1e3) return `$${sig(n / 1e3, 3)}k`
  }
  return `$${nf0.format(n)}`
}

/** Share of Earth's land as a readable string. */
export function formatShare(share: number): string {
  const pct = share * 100
  if (pct >= 0.01) return `${sig(pct, 2)}% of Earth’s land`
  if (pct >= 1e-5) return `${sig(pct, 2)}% of Earth’s land`
  const denominator = 1 / share
  return `1 part in ${formatBigCount(denominator)} of Earth’s land`
}

export function formatBigCount(n: number): string {
  if (n >= 1e12) return `${sig(n / 1e12, 2)} trillion`
  if (n >= 1e9) return `${sig(n / 1e9, 2)} billion`
  if (n >= 1e6) return `${sig(n / 1e6, 2)} million`
  return nf0.format(n)
}

export function formatRatio(r: number): string {
  if (r >= 1000) return `${nf0.format(r)}×`
  if (r >= 10) return `${sig(r, 3)}×`
  return `${sig(r, 2)}×`
}

// ---------- "about the size of" ----------

export interface SizeComparison {
  /** Sentence fragment, e.g. "about the size of Belgium". */
  text: string
  refs: LandRef[]
}

function ratioPhrase(ratio: number, phrase: string): string {
  if (ratio > 0.88 && ratio < 1.14) return `about the size of ${phrase}`
  if (ratio >= 1.14 && ratio < 1.35) return `a little bigger than ${phrase}`
  if (ratio > 0.74 && ratio <= 0.88) return `a little smaller than ${phrase}`
  if (ratio >= 1.35) return `about ${sig(ratio, 2)}× ${phrase}`
  return `about ${Math.round((ratio) * 100)}% of ${phrase}`
}

/** Nearest single reference in log space. */
export function nearestRef(km2: number, refs: LandRef[] = LAND_REFS_SORTED): LandRef {
  let best = refs[0]
  let bestDist = Infinity
  const target = Math.log(km2)
  for (const r of refs) {
    const d = Math.abs(Math.log(r.km2) - target)
    if (d < bestDist) {
      bestDist = d
      best = r
    }
  }
  return best
}

const COUNTRY_REFS = LAND_REFS_SORTED.filter((r) => r.kind === 'country')

/** Best two-country sum, used when no single country is close. */
export function nearestCountryPair(km2: number): [LandRef, LandRef] | null {
  let best: [LandRef, LandRef] | null = null
  let bestErr = Infinity
  for (let i = 0; i < COUNTRY_REFS.length; i++) {
    const a = COUNTRY_REFS[i]
    if (a.km2 >= km2) break
    for (let j = i + 1; j < COUNTRY_REFS.length; j++) {
      const b = COUNTRY_REFS[j]
      const sum = a.km2 + b.km2
      const err = Math.abs(Math.log(sum / km2))
      if (err < bestErr) {
        bestErr = err
        best = [a, b]
      }
      if (sum > km2 * 1.5) break
    }
  }
  return bestErr < 0.06 ? best : null
}

const LARGEST_COUNTRY = COUNTRY_REFS[COUNTRY_REFS.length - 1]

export function describeArea(km2: number): SizeComparison {
  if (!Number.isFinite(km2) || km2 <= 0) return { text: 'nothing at all', refs: [] }
  const smallest = LAND_REFS_SORTED[0]
  if (km2 < smallest.km2 * 0.5) return { text: `smaller than ${smallest.phrase}`, refs: [smallest] }

  if (km2 > LARGEST_COUNTRY.km2 * 1.14) {
    const fill = greedyCountries(km2, 6)
    const names = fill.countries.map((c) => displayName(c))
    const joined = joinNames(names)
    if (fill.remainderKm2 / km2 > 0.04) {
      const rest = nearestRef(fill.remainderKm2)
      const ratio = fill.remainderKm2 / rest.km2
      const restText = ratio > 0.88 && ratio < 1.14 ? rest.phrase : `${sig(ratio, 2)}× ${rest.phrase}`
      return { text: `${joined}, plus roughly ${restText}`, refs: fill.countryRefs }
    }
    return { text: `${joined} combined`, refs: fill.countryRefs }
  }

  const single = nearestRef(km2)
  const ratio = km2 / single.km2
  if (ratio > 0.88 && ratio < 1.14) return { text: ratioPhrase(ratio, single.phrase), refs: [single] }

  if (single.kind === 'country' || single.kind === 'region') {
    const pair = nearestCountryPair(km2)
    if (pair) return { text: `about the size of ${pair[0].label} and ${pair[1].label} together`, refs: pair }
  }
  return { text: ratioPhrase(ratio, single.phrase), refs: [single] }
}

export interface GreedyFill {
  countries: Country[]
  countryRefs: LandRef[]
  coveredKm2: number
  remainderKm2: number
}

const COUNTRIES_BY_LAND_DESC = [...COUNTRIES].sort((a, b) => b.landKm2 - a.landKm2)

/**
 * Largest-first fill of an area with whole countries. `minFraction` stops the
 * list ending in tiny fillers (no "…and Lesotho").
 */
export function greedyCountries(km2: number, max = 8, minFraction = 0): GreedyFill {
  const picked: Country[] = []
  let remaining = km2
  const floor = km2 * minFraction
  for (const c of COUNTRIES_BY_LAND_DESC) {
    if (picked.length >= max) break
    if (c.landKm2 < floor) break
    if (c.landKm2 <= remaining) {
      picked.push(c)
      remaining -= c.landKm2
    }
  }
  const refs = picked.map(
    (c) =>
      COUNTRY_REFS.find((r) => r.iso3 === c.iso3) ?? {
        id: c.iso3,
        label: c.name,
        phrase: c.name,
        km2: c.landKm2,
        kind: 'country' as const,
        iso3: c.iso3,
      },
  )
  return { countries: picked, countryRefs: refs, coveredKm2: km2 - remaining, remainderKm2: remaining }
}

function displayName(c: Country): string {
  return c.iso3 === 'USA' ? 'the United States' : c.name
}

function joinNames(names: string[]): string {
  if (names.length <= 1) return names[0] ?? ''
  return `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}`
}
