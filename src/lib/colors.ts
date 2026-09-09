import { scaleLog } from 'd3-scale'
import { COUNTRIES } from '../data/countries'
import { landClaimKm2 } from './allocation'

export type ColorMetric = 'mean' | 'median' | 'claimMean' | 'claimMedian'

export const COLOR_METRIC_LABEL: Record<ColorMetric, string> = {
  mean: 'Mean wealth per adult',
  median: 'Median wealth per adult',
  claimMean: 'Land claim, mean adult',
  claimMedian: 'Land claim, median adult',
}

export const GOLD = '#e2b74a'
export const COMPARE = '#5fd3e6'
export const NO_DATA = 'rgba(70, 78, 94, 0.55)'
export const STROKE = 'rgba(11, 15, 23, 0.9)'

/** "#rrggbb" → "rgba(r, g, b, a)". Passes non-hex strings through. */
export function withAlpha(color: string, alpha: number): string {
  if (!color.startsWith('#') || color.length !== 7) return color
  const r = parseInt(color.slice(1, 3), 16)
  const g = parseInt(color.slice(3, 5), 16)
  const b = parseInt(color.slice(5, 7), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

/** dark slate → blue → green → gold */
const STOPS: [number, number, number][] = [
  [30, 37, 51],
  [47, 111, 209],
  [63, 179, 111],
  [226, 183, 74],
]

function lerpStops(t: number): [number, number, number] {
  const x = Math.min(1, Math.max(0, t)) * (STOPS.length - 1)
  const i = Math.min(STOPS.length - 2, Math.floor(x))
  const f = x - i
  const a = STOPS[i]
  const b = STOPS[i + 1]
  return [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f, a[2] + (b[2] - a[2]) * f]
}

export function rampColor(t: number, alpha = 1): string {
  const [r, g, b] = lerpStops(t)
  return `rgba(${r | 0}, ${g | 0}, ${b | 0}, ${alpha})`
}

/** CSS gradient string for the legend bar. */
export const RAMP_CSS = `linear-gradient(90deg, ${[0, 0.33, 0.66, 1].map((t) => rampColor(t)).join(', ')})`

export interface MetricScale {
  metric: ColorMetric
  min: number
  max: number
  /** Metric value for a country, or null when it has no such value. */
  valueOf: (iso3: string) => number | null
  /** 0..1 position on the ramp. */
  t: (value: number) => number
  color: (value: number, alpha?: number) => string
}

function metricValue(metric: ColorMetric, mean: number, median: number | null): number | null {
  switch (metric) {
    case 'mean':
      return mean
    case 'median':
      return median
    case 'claimMean':
      return landClaimKm2(mean)
    case 'claimMedian':
      return median === null ? null : landClaimKm2(median)
  }
}

const cache = new Map<ColorMetric, MetricScale>()

/** Memoised per metric: domain from the data, log ramp, 256-bucket colour cache. */
export function metricScale(metric: ColorMetric): MetricScale {
  const hit = cache.get(metric)
  if (hit) return hit

  const values = new Map<string, number | null>()
  let min = Infinity
  let max = -Infinity
  for (const c of COUNTRIES) {
    const v = metricValue(metric, c.mean, c.median)
    values.set(c.iso3, v)
    if (v !== null && v > 0) {
      if (v < min) min = v
      if (v > max) max = v
    }
  }
  const scale = scaleLog<number, number>().domain([min, max]).range([0, 1]).clamp(true)
  const buckets = new Map<number, string>()
  const t = (v: number) => scale(v)
  const color = (v: number, alpha = 1) => {
    const bucket = Math.round(t(v) * 255) + alpha * 1000
    const c = buckets.get(bucket)
    if (c) return c
    const out = rampColor(t(v), alpha)
    buckets.set(bucket, out)
    return out
  }
  const out: MetricScale = { metric, min, max, valueOf: (iso3) => values.get(iso3) ?? null, t, color }
  cache.set(metric, out)
  return out
}
