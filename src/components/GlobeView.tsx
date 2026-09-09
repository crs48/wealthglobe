import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Globe, { type GlobeMethods } from 'react-globe.gl'
import type { Feature, Polygon } from 'geojson'
import { COUNTRIES, COUNTRY_BY_ISO3, type Country } from '../data/countries'
import { PEOPLE } from '../data/people'
import { RICHEST } from '../data/richest'
import type { Stat } from '../data/personas'
import { formatArea, formatRatio, formatUsd, landClaimKm2 } from '../lib/allocation'
import { COMPARE, GOLD, NO_DATA, STROKE, metricScale, withAlpha } from '../lib/colors'
import { claimCirclePolygon, frameFeature, radiusKmToDeg, type CountryCollection, type CountryFeature, type Framing } from '../lib/geo'
import { useElementSize, useResolved } from '../lib/hooks'
import { statForMode, useStore } from '../store'

const BASE = import.meta.env.BASE_URL

interface ClaimProps {
  kind: 'claim'
  key: string
  color: string
}
type ClaimFeature = Feature<Polygon, ClaimProps>
type AnyFeature = CountryFeature | ClaimFeature

interface Ring {
  lat: number
  lng: number
  maxR: number
  color: string
}

interface Label {
  id: string
  lat: number
  lng: number
  text: string
  size: number
  dot: number
  color: string
  kind: 'country' | 'person'
}

interface Pin {
  key: string
  lat: number
  lng: number
  color: string
  label: string
}

function isClaim(d: object): d is ClaimFeature {
  const props = (d as AnyFeature).properties as Partial<ClaimProps>
  return props.kind === 'claim'
}

const nf = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 })

function tooltipHtml(c: Country | undefined, name: string, stat: Stat): string {
  if (!c) {
    return `<div class="tip-title">${name}</div><div class="tip-note">No wealth data in the sample.</div>`
  }
  const claimMean = landClaimKm2(c.mean)
  const claimMedian = c.median === null ? null : landClaimKm2(c.median)
  const richest = RICHEST[c.iso3]
  const rows: [string, string][] = [
    ['Mean / adult', formatUsd(c.mean)],
    ['Median / adult', c.median === null ? '—' : formatUsd(c.median)],
    ['Adults', `${nf.format(c.adults / 1e6)}M`],
    ['Land', formatArea(c.landKm2)],
    ['Mean-adult claim', formatArea(claimMean)],
    ['Median-adult claim', claimMedian === null ? '—' : formatArea(claimMedian)],
    ['Mean ÷ median', c.median === null ? '—' : formatRatio(c.mean / c.median)],
    ['Wealthiest individual', richest ? formatUsd(richest.wealthUsd, { compact: true }) : 'none on Forbes list'],
    ['Their claim', richest ? formatArea(landClaimKm2(richest.wealthUsd)) : '—'],
  ]
  const active = stat === 'mean' ? 'mean' : 'median'
  return (
    `<div class="tip-title">${c.name}</div>` +
    `<dl class="tip-grid">${rows
      .map(([k, v]) => `<dt>${k}</dt><dd${k.toLowerCase().startsWith(active) ? ' style="color:#f3d78a"' : ''}>${v}</dd>`)
      .join('')}</dl>` +
    `<div class="tip-note">${c.confidence === 'official-ubs' ? 'UBS 2026' : c.confidence === 'regional-proxy' ? 'Regional proxy' : 'Databook estimate'} · click to select</div>`
  )
}

function makePin(pin: Pin): HTMLElement {
  const el = document.createElement('div')
  el.className = 'pin'
  el.setAttribute('aria-hidden', 'true')
  el.innerHTML = `<svg class="pin-pulse" width="26" height="36" viewBox="0 0 26 36"><path d="M13 35 C13 35 2 20 2 12 A11 11 0 0 1 24 12 C24 20 13 35 13 35Z" fill="${pin.color}" stroke="#0b0f17" stroke-width="1.5"/><circle cx="13" cy="12" r="4" fill="#0b0f17"/></svg>`
  return el
}

export function GlobeView() {
  const containerRef = useRef<HTMLDivElement>(null)
  const globeRef = useRef<GlobeMethods | undefined>(undefined)
  const size = useElementSize(containerRef)
  const [features, setFeatures] = useState<CountryFeature[]>([])
  const [ready, setReady] = useState(false)

  const mode = useStore((s) => s.mode)
  const colorMetric = useStore((s) => s.colorMetric)
  const hoverIso3 = useStore((s) => s.hoverIso3)
  const selected = useStore((s) => s.selected)
  const compare = useStore((s) => s.compare)
  const autoRotate = useStore((s) => s.autoRotate)
  const reducedMotion = useStore((s) => s.reducedMotion)
  const cameraTarget = useStore((s) => s.cameraTarget)
  const setFramings = useStore((s) => s.setFramings)
  const select = useStore((s) => s.select)
  const setHover = useStore((s) => s.setHover)
  const setAutoRotate = useStore((s) => s.setAutoRotate)

  const stat = statForMode(mode)
  const sel = useResolved(selected, GOLD)
  const cmp = useResolved(compare, COMPARE)
  const scale = useMemo(() => metricScale(colorMetric), [colorMetric])

  // Load the vendored Natural Earth polygons once.
  useEffect(() => {
    let cancelled = false
    fetch(`${BASE}data/countries-110m.geojson`)
      .then((r) => r.json())
      .then((geo: CountryCollection) => {
        if (cancelled) return
        setFeatures(geo.features)
        const framings: Record<string, Framing> = {}
        for (const f of geo.features) framings[f.properties.iso3] = frameFeature(f)
        setFramings(framings)
      })
      .catch((err) => console.error('GeoJSON failed to load', err))
    return () => {
      cancelled = true
    }
  }, [setFramings])

  const highlightIso3 = sel && (sel.kind === 'country' || sel.kind === 'persona') ? (sel.iso3 ?? null) : null
  const compareIso3 = cmp && (cmp.kind === 'country' || cmp.kind === 'persona') ? (cmp.iso3 ?? null) : null
  const tierSet = useMemo(() => (sel?.tierFill ? new Set(sel.tierFill.countries.map((c) => c.iso3)) : null), [sel])
  const tierColor = sel?.tier?.color ?? GOLD

  const claimFeatures = useMemo<ClaimFeature[]>(
    () =>
      [sel, cmp]
        .filter((s): s is NonNullable<typeof s> => !!s && !s.isTiny && s.kind !== 'tier')
        .map((s) => ({
          type: 'Feature',
          properties: { kind: 'claim', key: s.key, color: s.color },
          geometry: claimCirclePolygon(s.lat, s.lng, s.radiusKm),
        })),
    [sel, cmp],
  )
  const polygons = useMemo<AnyFeature[]>(() => [...features, ...claimFeatures], [features, claimFeatures])

  const polygonAltitude = useCallback((d: object) => (isClaim(d) ? 0.014 : 0.006), [])

  const polygonCapColor = useCallback(
    (d: object) => {
      if (isClaim(d)) return withAlpha(d.properties.color, 0.5)
      const iso3 = (d as CountryFeature).properties.iso3
      if (tierSet) return tierSet.has(iso3) ? withAlpha(tierColor, 0.92) : 'rgba(38, 44, 58, 0.55)'
      const v = scale.valueOf(iso3)
      if (v === null) return NO_DATA
      const lit = iso3 === highlightIso3 || iso3 === compareIso3 ? 1 : iso3 === hoverIso3 ? 0.97 : 0.8
      return scale.color(v, lit)
    },
    [scale, tierSet, tierColor, highlightIso3, compareIso3, hoverIso3],
  )

  const polygonSideColor = useCallback((d: object) => (isClaim(d) ? withAlpha(d.properties.color, 0.35) : 'rgba(11, 15, 23, 0.55)'), [])

  const polygonStrokeColor = useCallback(
    (d: object) => {
      if (isClaim(d)) return d.properties.color
      const iso3 = (d as CountryFeature).properties.iso3
      if (iso3 === highlightIso3) return GOLD
      if (iso3 === compareIso3) return COMPARE
      if (iso3 === hoverIso3) return '#ffffff'
      return STROKE
    },
    [highlightIso3, compareIso3, hoverIso3],
  )

  const polygonLabel = useCallback(
    (d: object) => {
      if (isClaim(d)) return ''
      const p = (d as CountryFeature).properties
      return tooltipHtml(COUNTRY_BY_ISO3.get(p.iso3), p.name, stat)
    },
    [stat],
  )

  const onPolygonClick = useCallback(
    (d: object) => {
      if (isClaim(d)) return
      const iso3 = (d as CountryFeature).properties.iso3
      if (!COUNTRY_BY_ISO3.has(iso3)) return
      select({ kind: 'country', iso3, stat })
    },
    [select, stat],
  )

  const onPolygonHover = useCallback(
    (d: object | null) => setHover(d && !isClaim(d) ? (d as CountryFeature).properties.iso3 : null),
    [setHover],
  )

  const rings = useMemo<Ring[]>(() => {
    if (reducedMotion) return []
    return [sel, cmp]
      .filter((s): s is NonNullable<typeof s> => !!s && s.kind !== 'tier')
      .map((s) => ({
        lat: s.lat,
        lng: s.lng,
        maxR: s.isTiny ? 1.4 : radiusKmToDeg(s.radiusKm) * 1.25,
        color: s.color,
      }))
  }, [sel, cmp, reducedMotion])

  const ringColor = useCallback((d: object) => {
    const color = (d as Ring).color
    return (t: number) => withAlpha(color, (1 - t) * 0.7)
  }, [])
  const ringMaxRadius = useCallback((d: object) => (d as Ring).maxR, [])
  const ringSpeed = useCallback((d: object) => (d as Ring).maxR / 1.8, [])

  const labels = useMemo<Label[]>(() => {
    const out: Label[] = COUNTRIES.filter((c) => c.lat !== undefined).map((c) => ({
      id: c.iso3,
      lat: c.lat!,
      lng: c.lng!,
      text: c.name,
      size: 0.32,
      dot: 0.16,
      color: '#c3ccda',
      kind: 'country',
    }))
    if (mode === 'named') {
      // Several fortunes share a metro area (Austin, the Bay Area). Fan
      // their labels out so each stays legible.
      const seen = new Map<string, number>()
      for (const p of PEOPLE) {
        const k = `${Math.round(p.lat * 2) / 2},${Math.round(p.lng * 2) / 2}`
        const n = seen.get(k) ?? 0
        seen.set(k, n + 1)
        out.push({ id: p.id, lat: p.lat - n * 0.55, lng: p.lng + n * 0.25, text: p.name, size: 0.42, dot: 0.22, color: GOLD, kind: 'person' })
      }
    }
    return out
  }, [mode])

  const onLabelClick = useCallback(
    (d: object) => {
      const l = d as Label
      if (l.kind === 'person') select({ kind: 'person', id: l.id })
      else select({ kind: 'country', iso3: l.id, stat })
    },
    [select, stat],
  )

  const pins = useMemo<Pin[]>(
    () =>
      [sel, cmp]
        .filter((s): s is NonNullable<typeof s> => !!s && s.isTiny)
        .map((s) => ({ key: s.key, lat: s.lat, lng: s.lng, color: s.color, label: s.label })),
    [sel, cmp],
  )
  const htmlElement = useCallback((d: object) => makePin(d as Pin), [])

  // Camera moves.
  useEffect(() => {
    const g = globeRef.current
    if (!g || !ready || !cameraTarget) return
    g.pointOfView({ lat: cameraTarget.lat, lng: cameraTarget.lng, altitude: cameraTarget.altitude }, reducedMotion ? 0 : 1400)
  }, [cameraTarget, ready, reducedMotion])

  // Auto-rotate, and stop rotating as soon as the user grabs the globe.
  useEffect(() => {
    const g = globeRef.current
    if (!g || !ready) return
    const controls = g.controls()
    controls.autoRotate = autoRotate
    controls.autoRotateSpeed = 0.35
    controls.enableDamping = true
    controls.dampingFactor = 0.08
    const onStart = () => {
      if (useStore.getState().autoRotate) setAutoRotate(false)
    }
    controls.addEventListener('start', onStart)
    return () => controls.removeEventListener('start', onStart)
  }, [autoRotate, ready, setAutoRotate])

  const onGlobeReady = useCallback(() => {
    setReady(true)
    globeRef.current?.pointOfView({ lat: 12, lng: 18, altitude: 2.3 }, 0)
  }, [])

  return (
    <div ref={containerRef} className="absolute inset-0" aria-label="Interactive globe" role="img">
      {size.width > 0 && (
        <Globe
          ref={globeRef}
          width={size.width}
          height={size.height}
          globeImageUrl={`${BASE}data/earth-night.jpg`}
          bumpImageUrl={`${BASE}data/earth-topology.png`}
          backgroundImageUrl={`${BASE}data/night-sky.png`}
          showAtmosphere
          atmosphereColor="#3f7bdc"
          atmosphereAltitude={0.16}
          animateIn={!reducedMotion}
          rendererConfig={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
          onGlobeReady={onGlobeReady}
          polygonsData={polygons}
          polygonAltitude={polygonAltitude}
          polygonCapColor={polygonCapColor}
          polygonSideColor={polygonSideColor}
          polygonStrokeColor={polygonStrokeColor}
          polygonLabel={polygonLabel}
          polygonsTransitionDuration={0}
          onPolygonClick={onPolygonClick}
          onPolygonHover={onPolygonHover}
          ringsData={rings}
          ringLat={(d: object) => (d as Ring).lat}
          ringLng={(d: object) => (d as Ring).lng}
          ringAltitude={0.016}
          ringColor={ringColor}
          ringMaxRadius={ringMaxRadius}
          ringPropagationSpeed={ringSpeed}
          ringRepeatPeriod={1700}
          labelsData={labels}
          labelLat={(d: object) => (d as Label).lat}
          labelLng={(d: object) => (d as Label).lng}
          labelText={(d: object) => (d as Label).text}
          labelSize={(d: object) => (d as Label).size}
          labelDotRadius={(d: object) => (d as Label).dot}
          labelColor={(d: object) => (d as Label).color}
          labelAltitude={0.012}
          labelResolution={2}
          onLabelClick={onLabelClick}
          htmlElementsData={pins}
          htmlLat={(d: object) => (d as Pin).lat}
          htmlLng={(d: object) => (d as Pin).lng}
          htmlAltitude={0.012}
          htmlElement={htmlElement}
        />
      )}
    </div>
  )
}
