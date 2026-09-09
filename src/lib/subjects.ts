import { COUNTRY_BY_ISO3, type Country } from '../data/countries'
import { CONFIDENCE_LABEL, META, type Confidence } from '../data/meta'
import { PEOPLE, PERSON_BY_ID } from '../data/people'
import { PERSONA_BY_ID, PERSONA_PAIR_BY_ID, type Stat } from '../data/personas'
import { REGIONAL_MEAN_BY_ID } from '../data/regions'
import { TIER_BY_ID, type Tier } from '../data/tiers'
import { EARTH_LAND_KM2, TRACKED_WEALTH_USD, circleRadiusKm, greedyCountries, landClaimKm2, type GreedyFill } from './allocation'
import { altitudeForRadiusKm, altitudeForSpan, type Framing } from './geo'
import { COMPARE, GOLD } from './colors'

export type SubjectRef =
  | { kind: 'country'; iso3: string; stat: Stat }
  | { kind: 'person'; id: string }
  | { kind: 'persona'; id: string }
  | { kind: 'custom'; netWorthUsd: number }
  | { kind: 'tier'; id: string }

export type SubjectKind = SubjectRef['kind']

export interface SubjectSource {
  label: string
  vintage: string
  confidence: Confidence
  confidenceLabel: string
}

export interface ResolvedSubject {
  key: string
  ref: SubjectRef
  kind: SubjectKind
  /** Small caps line above the title: "Median adult", "Named fortune". */
  eyebrow: string
  label: string
  sublabel: string
  /** Lower-case noun phrase for sentences: "the median adult in Kenya". */
  phrase: string
  /** For a tier this is the joint wealth of the whole tier. */
  netWorthUsd: number
  claimKm2: number
  radiusKm: number
  /** Claims under 1 km² get a pin and an inset instead of a circle. */
  isTiny: boolean
  lat: number
  lng: number
  altitude: number
  cameraLabel?: string
  color: string
  source: SubjectSource
  note?: string
  iso3?: string
  country?: Country
  stat?: Stat
  /** The other statistic for the same country, when both exist. */
  alt?: { stat: Stat; netWorthUsd: number; claimKm2: number }
  tier?: Tier
  tierFill?: GreedyFill
}

export const TINY_KM2 = 1

export function refKey(ref: SubjectRef): string {
  switch (ref.kind) {
    case 'country':
      return `country:${ref.iso3}:${ref.stat}`
    case 'person':
      return `person:${ref.id}`
    case 'persona':
      return `persona:${ref.id}`
    case 'custom':
      return `custom:${Math.round(ref.netWorthUsd)}`
    case 'tier':
      return `tier:${ref.id}`
  }
}

export function parseRefKey(key: string): SubjectRef | null {
  const parts = key.split(':')
  switch (parts[0]) {
    case 'country':
      if (parts.length === 3 && (parts[2] === 'mean' || parts[2] === 'median')) return { kind: 'country', iso3: parts[1], stat: parts[2] }
      return null
    case 'person':
      return PERSON_BY_ID.has(parts[1]) ? { kind: 'person', id: parts[1] } : null
    case 'persona':
      return PERSONA_BY_ID.has(parts[1]) ? { kind: 'persona', id: parts[1] } : null
    case 'custom': {
      const n = Number(parts[1])
      return Number.isFinite(n) && n > 0 ? { kind: 'custom', netWorthUsd: n } : null
    }
    case 'tier':
      return TIER_BY_ID.has(parts[1]) ? { kind: 'tier', id: parts[1] } : null
    default:
      return null
  }
}

export function sameRef(a: SubjectRef | null, b: SubjectRef | null): boolean {
  if (!a || !b) return a === b
  return refKey(a) === refKey(b)
}

export const STAT_LABEL: Record<Stat, string> = { mean: 'Mean adult', median: 'Median adult' }
export const STAT_PLAIN: Record<Stat, string> = { mean: 'average person', median: 'typical person' }

const TAKES_ARTICLE = new Set(['USA', 'GBR', 'NLD', 'PHL', 'BHS', 'ARE', 'COD', 'CAF', 'DOM', 'CZE', 'GMB', 'MDV', 'SLB'])

/** Country name as it reads mid-sentence: "the United States", "Kenya". */
export function countryInSentence(c: Country): string {
  return TAKES_ARTICLE.has(c.iso3) ? `the ${c.name}` : c.name
}

function countrySource(c: Country): SubjectSource {
  return { label: c.name, vintage: c.vintage, confidence: c.confidence, confidenceLabel: CONFIDENCE_LABEL[c.confidence] }
}

function countryStat(c: Country, stat: Stat): number | null {
  return stat === 'mean' ? c.mean : c.median
}

function altStat(c: Country, stat: Stat): ResolvedSubject['alt'] {
  const other: Stat = stat === 'mean' ? 'median' : 'mean'
  const v = countryStat(c, other)
  if (v === null) return undefined
  return { stat: other, netWorthUsd: v, claimKm2: landClaimKm2(v) }
}

function base(netWorthUsd: number) {
  const claimKm2 = landClaimKm2(netWorthUsd)
  const radiusKm = circleRadiusKm(claimKm2)
  return { netWorthUsd, claimKm2, radiusKm, isTiny: claimKm2 < TINY_KM2 }
}

function cameraAltitude(radiusKm: number, isTiny: boolean, framing?: Framing): number {
  if (!isTiny) return altitudeForRadiusKm(radiusKm)
  if (framing) return altitudeForSpan(framing.spanDeg)
  return 0.28
}

export type Framings = Readonly<Record<string, Framing>>

export function resolveSubject(ref: SubjectRef, framings: Framings, color = GOLD): ResolvedSubject | null {
  const key = refKey(ref)
  switch (ref.kind) {
    case 'country': {
      const c = COUNTRY_BY_ISO3.get(ref.iso3)
      if (!c) return null
      const stat: Stat = countryStat(c, ref.stat) === null ? 'mean' : ref.stat
      const value = countryStat(c, stat)!
      const b = base(value)
      const framing = framings[c.iso3]
      const lat = c.lat ?? framing?.lat ?? 0
      const lng = c.lng ?? framing?.lng ?? 0
      return {
        key,
        ref: { kind: 'country', iso3: c.iso3, stat },
        kind: 'country',
        eyebrow: STAT_LABEL[stat],
        label: c.name,
        sublabel: `${STAT_PLAIN[stat]} in ${c.name}`,
        phrase: `the ${stat} adult in ${countryInSentence(c)}`,
        ...b,
        lat,
        lng,
        altitude: cameraAltitude(b.radiusKm, b.isTiny, framing),
        color,
        source: countrySource(c),
        note: c.note,
        iso3: c.iso3,
        country: c,
        stat,
        alt: altStat(c, stat),
      }
    }
    case 'person': {
      const p = PERSON_BY_ID.get(ref.id)
      if (!p) return null
      const b = base(p.wealthUsd)
      const rank = PEOPLE.indexOf(p) + 1
      return {
        key,
        ref,
        kind: 'person',
        eyebrow: `Named fortune · #${rank}`,
        label: p.name,
        sublabel: `${p.role} · ${p.place}`,
        phrase: p.name,
        ...b,
        lat: p.lat,
        lng: p.lng,
        altitude: cameraAltitude(b.radiusKm, b.isTiny),
        cameraLabel: p.place,
        color,
        source: {
          label: 'Forbes',
          vintage: META.billionaireVintage.replace('Forbes ', ''),
          confidence: 'databook-estimate',
          confidenceLabel: 'Forbes snapshot',
        },
        note: 'Billionaire figures move daily with share prices. This is a dated reading.',
        iso3: p.iso3,
      }
    }
    case 'persona': {
      const p = PERSONA_BY_ID.get(ref.id)
      if (!p) return null
      const src = p.source
      if (src.kind === 'country') {
        const c = COUNTRY_BY_ISO3.get(src.iso3)
        if (!c) return null
        const value = countryStat(c, src.stat)
        if (value === null) return null
        const b = base(value)
        return {
          key,
          ref,
          kind: 'persona',
          eyebrow: `${STAT_LABEL[src.stat]} · ${c.name}`,
          label: p.label,
          sublabel: p.sublabel,
          phrase: p.proxyNote ? `${p.label.toLowerCase()} (${c.name} ${src.stat})` : `the ${src.stat} adult in ${countryInSentence(c)}`,
          ...b,
          lat: p.lat,
          lng: p.lng,
          altitude: 0.3,
          cameraLabel: p.cameraLabel,
          color,
          source: countrySource(c),
          note: p.proxyNote ?? c.note,
          iso3: c.iso3,
          country: c,
          stat: src.stat,
          alt: altStat(c, src.stat),
        }
      }
      if (src.kind === 'region') {
        const r = REGIONAL_MEAN_BY_ID.get(src.id)
        if (!r) return null
        const value = src.stat === 'mean' ? r.mean : r.median
        if (value === undefined) return null
        const b = base(value)
        return {
          key,
          ref,
          kind: 'persona',
          eyebrow: `${STAT_LABEL[src.stat]} · region`,
          label: p.label,
          sublabel: p.sublabel,
          phrase: `the ${src.stat} adult in ${r.label}`,
          ...b,
          lat: p.lat,
          lng: p.lng,
          altitude: 1.1,
          cameraLabel: p.cameraLabel,
          color,
          source: { label: r.label, vintage: r.vintage, confidence: 'regional-proxy', confidenceLabel: CONFIDENCE_LABEL['regional-proxy'] },
          note: p.proxyNote,
          stat: src.stat,
          alt: r.median !== undefined && src.stat === 'mean' ? { stat: 'median', netWorthUsd: r.median, claimKm2: landClaimKm2(r.median) } : undefined,
        }
      }
      // world
      const value = src.stat === 'mean' ? TRACKED_WEALTH_USD / META.worldAdults : META.worldMedianUsd
      const b = base(value)
      return {
        key,
        ref,
        kind: 'persona',
        eyebrow: `${STAT_LABEL[src.stat]} · world`,
        label: p.label,
        sublabel: p.sublabel,
        phrase: `the world ${src.stat} adult`,
        ...b,
        lat: p.lat,
        lng: p.lng,
        altitude: 1.6,
        cameraLabel: p.cameraLabel,
        color,
        source: {
          label: 'World',
          vintage: src.stat === 'mean' ? META.wealthVintage : META.worldMedianVintage,
          confidence: 'official-ubs',
          confidenceLabel: CONFIDENCE_LABEL['official-ubs'],
        },
        note: p.proxyNote,
        stat: src.stat,
        alt:
          src.stat === 'mean'
            ? { stat: 'median', netWorthUsd: META.worldMedianUsd, claimKm2: landClaimKm2(META.worldMedianUsd) }
            : { stat: 'mean', netWorthUsd: TRACKED_WEALTH_USD / META.worldAdults, claimKm2: landClaimKm2(TRACKED_WEALTH_USD / META.worldAdults) },
      }
    }
    case 'custom': {
      const b = base(ref.netWorthUsd)
      return {
        key,
        ref,
        kind: 'custom',
        eyebrow: 'Your net worth',
        label: 'You',
        sublabel: 'Any USD figure, placed on the map',
        phrase: 'your',
        ...b,
        lat: 20,
        lng: 0,
        altitude: cameraAltitude(b.radiusKm, b.isTiny),
        color,
        source: { label: 'Entered by you', vintage: 'now', confidence: 'official-ubs', confidenceLabel: 'Your figure' },
      }
    }
    case 'tier': {
      const t = TIER_BY_ID.get(ref.id)
      if (!t) return null
      const jointWealth = t.wealthShare * TRACKED_WEALTH_USD
      const claimKm2 = t.wealthShare * EARTH_LAND_KM2
      return {
        key,
        ref,
        kind: 'tier',
        eyebrow: 'Wealth tier',
        label: `${t.label} (${t.range})`,
        sublabel: `${(t.adultShare * 100).toFixed(1)}% of adults, ${(t.wealthShare * 100).toFixed(1)}% of wealth`,
        phrase: `the ${t.label.toLowerCase()} tier`,
        netWorthUsd: jointWealth,
        claimKm2,
        radiusKm: circleRadiusKm(claimKm2),
        isTiny: false,
        lat: 30,
        lng: 20,
        altitude: 2.2,
        color: t.color,
        source: { label: 'UBS wealth pyramid', vintage: META.wealthVintage, confidence: 'official-ubs', confidenceLabel: CONFIDENCE_LABEL['official-ubs'] },
        tier: t,
        tierFill: greedyCountries(claimKm2, 8, 0.02),
      }
    }
  }
}

/** Personas pairs resolve to two subjects: the first selected, the second compared. */
export function resolvePair(id: string): [SubjectRef, SubjectRef] | null {
  const pair = PERSONA_PAIR_BY_ID.get(id)
  if (!pair) return null
  return [
    { kind: 'persona', id: pair.a },
    { kind: 'persona', id: pair.b },
  ]
}

export const COMPARE_COLOR = COMPARE
