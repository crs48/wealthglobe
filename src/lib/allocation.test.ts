import { describe, expect, it } from 'vitest'
import { TIERS } from '../data/tiers'
import { COUNTRIES } from '../data/countries'
import { PERSONAS } from '../data/personas'
import {
  EARTH_LAND_KM2,
  circleRadiusKm,
  describeArea,
  formatArea,
  greedyCountries,
  landClaimKm2,
  landShare,
  squareSideM,
} from './allocation'

describe('landClaimKm2 fixtures from the brief', () => {
  it('Elon Musk at $908.2B claims roughly 261,000 km² (≈ the UK)', () => {
    const km2 = landClaimKm2(908.2e9)
    expect(km2).toBeGreaterThan(255_000)
    expect(km2).toBeLessThan(267_000)
    // 261k km² sits between the UK (242k) and New Zealand (265k).
    expect(describeArea(km2).text).toMatch(/United Kingdom|New Zealand/)
  })

  it('US mean $696,277 claims about 0.20 km²', () => {
    expect(landClaimKm2(696_277)).toBeCloseTo(0.2003, 3)
  })

  it('US median $68,998 claims about 0.020 km²', () => {
    expect(landClaimKm2(68_998)).toBeCloseTo(0.01985, 4)
  })

  it('$2,000 claims about 575 m²', () => {
    const m2 = landClaimKm2(2000) * 1e6
    expect(m2).toBeGreaterThan(570)
    expect(m2).toBeLessThan(580)
  })

  it('the millionaire tier (48.4%) holds about 72 million km²', () => {
    const tier = TIERS.find((t) => t.id === 'millionaires')!
    const km2 = tier.wealthShare * EARTH_LAND_KM2
    expect(km2 / 1e6).toBeCloseTo(72.1, 1)
    const fill = greedyCountries(km2, 5)
    expect(fill.countries.map((c) => c.iso3)).toEqual(['RUS', 'CHN', 'USA', 'CAN', 'BRA'])
  })
})

describe('derived quantities', () => {
  it('share and radius are consistent with the area', () => {
    const km2 = landClaimKm2(1e6)
    expect(landShare(km2)).toBeCloseTo(1e6 / 517.69e12, 20)
    expect(Math.PI * circleRadiusKm(km2) ** 2).toBeCloseTo(km2, 8)
    expect(squareSideM(km2) ** 2).toBeCloseTo(km2 * 1e6, 3)
  })

  it('formats areas in the readable unit', () => {
    expect(formatArea(261_300)).toBe('261,300 km²')
    expect(formatArea(0.2003)).toBe('20 ha')
    expect(formatArea(0.0199)).toBe('1.99 ha')
    expect(formatArea(0.000575)).toBe('575 m²')
  })
})

describe('data integrity', () => {
  it('every country has a positive mean, land area and adults', () => {
    for (const c of COUNTRIES) {
      expect(c.mean, c.iso3).toBeGreaterThan(0)
      expect(c.landKm2, c.iso3).toBeGreaterThan(0)
      expect(c.adults, c.iso3).toBeGreaterThan(0)
      if (c.median !== null) expect(c.median, c.iso3).toBeLessThanOrEqual(c.mean)
    }
  })

  it('every persona points at a country that has the statistic it uses', () => {
    for (const p of PERSONAS) {
      const src = p.source
      if (src.kind !== 'country') continue
      const c = COUNTRIES.find((x) => x.iso3 === src.iso3)
      expect(c, p.id).toBeDefined()
      if (src.stat === 'median') expect(c!.median, p.id).not.toBeNull()
    }
  })

  it('the required low-wealth countries are first-class rows', () => {
    for (const iso3 of ['HTI', 'SLE', 'BDI', 'ETH', 'MWI', 'COD', 'NGA', 'KEN', 'CAF', 'NER', 'TCD', 'MDG', 'UGA', 'BFA']) {
      expect(COUNTRIES.some((c) => c.iso3 === iso3), iso3).toBe(true)
    }
  })
})
