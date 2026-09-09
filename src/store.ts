import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Stat } from './data/personas'
import type { ColorMetric } from './lib/colors'
import type { Framing } from './lib/geo'
import { refKey, resolvePair, resolveSubject, sameRef, type Framings, type SubjectRef } from './lib/subjects'

export type Mode = 'median' | 'mean' | 'named'
export type Tab = 'places' | 'people' | 'lives' | 'tiers'
export type SheetSnap = 'peek' | 'half' | 'full'

export interface CameraTarget {
  lat: number
  lng: number
  altitude: number
  nonce: number
}

export interface WealthGlobeState {
  mode: Mode
  colorMetric: ColorMetric
  tab: Tab
  selected: SubjectRef | null
  compare: SubjectRef | null
  comparePending: boolean
  hoverIso3: string | null
  autoRotate: boolean
  reducedMotion: boolean
  isTouch: boolean
  customNetWorth: number
  query: string
  framings: Framings
  cameraTarget: CameraTarget | null
  sheet: SheetSnap
  geoReady: boolean

  setMode: (mode: Mode) => void
  setColorMetric: (metric: ColorMetric) => void
  setTab: (tab: Tab) => void
  select: (ref: SubjectRef, opts?: { fly?: boolean }) => void
  selectPair: (pairId: string) => void
  clearSelection: () => void
  startCompare: () => void
  cancelCompare: () => void
  clearCompare: () => void
  swapCompare: () => void
  setHover: (iso3: string | null) => void
  setAutoRotate: (on: boolean) => void
  setReducedMotion: (on: boolean) => void
  setIsTouch: (on: boolean) => void
  setCustomNetWorth: (usd: number) => void
  setQuery: (q: string) => void
  setFramings: (framings: Record<string, Framing>) => void
  flyTo: (lat: number, lng: number, altitude: number) => void
  setSheet: (snap: SheetSnap) => void
}

/** The current statistic for country subjects, derived from the top toggle. */
export function statForMode(mode: Mode): Stat {
  return mode === 'mean' ? 'mean' : 'median'
}

function metricForMode(mode: Mode, current: ColorMetric): ColorMetric {
  if (mode === 'named') return current
  const claim = current === 'claimMean' || current === 'claimMedian'
  if (mode === 'mean') return claim ? 'claimMean' : 'mean'
  return claim ? 'claimMedian' : 'median'
}

let nonce = 0

export const useStore = create<WealthGlobeState>()(
  persist(
    (set, get) => ({
      mode: 'median',
      colorMetric: 'median',
      tab: 'lives',
      selected: null,
      compare: null,
      comparePending: false,
      hoverIso3: null,
      autoRotate: true,
      reducedMotion: false,
      isTouch: false,
      customNetWorth: 50_000,
      query: '',
      framings: {},
      cameraTarget: null,
      sheet: 'peek',
      geoReady: false,

      setMode: (mode) => {
        const s = get()
        const stat = statForMode(mode)
        const retarget = (ref: SubjectRef | null): SubjectRef | null =>
          ref && ref.kind === 'country' && mode !== 'named' ? { kind: 'country', iso3: ref.iso3, stat } : ref
        set({
          mode,
          colorMetric: metricForMode(mode, s.colorMetric),
          selected: retarget(s.selected),
          compare: retarget(s.compare),
          tab: mode === 'named' ? 'people' : s.tab === 'people' ? 'places' : s.tab,
        })
      },
      setColorMetric: (colorMetric) => set({ colorMetric }),
      setTab: (tab) => set({ tab }),

      select: (ref, opts) => {
        const s = get()
        const fly = opts?.fly ?? true
        const resolved = resolveSubject(ref, s.framings)
        const cameraTarget =
          fly && resolved ? { lat: resolved.lat, lng: resolved.lng, altitude: resolved.altitude, nonce: ++nonce } : s.cameraTarget
        const sheet = s.sheet === 'peek' ? 'half' : s.sheet
        if (s.comparePending && s.selected && !sameRef(s.selected, ref)) {
          set({ compare: ref, comparePending: false, cameraTarget, sheet, autoRotate: false })
          return
        }
        set({ selected: ref, comparePending: false, cameraTarget, sheet, autoRotate: false })
      },

      selectPair: (pairId) => {
        const pair = resolvePair(pairId)
        if (!pair) return
        const s = get()
        const resolved = resolveSubject(pair[0], s.framings)
        set({
          selected: pair[0],
          compare: pair[1],
          comparePending: false,
          autoRotate: false,
          sheet: s.sheet === 'peek' ? 'half' : s.sheet,
          cameraTarget: resolved ? { lat: resolved.lat, lng: resolved.lng, altitude: resolved.altitude, nonce: ++nonce } : s.cameraTarget,
        })
      },

      clearSelection: () => set({ selected: null, compare: null, comparePending: false }),
      startCompare: () => set({ comparePending: true }),
      cancelCompare: () => set({ comparePending: false }),
      clearCompare: () => set({ compare: null, comparePending: false }),
      swapCompare: () => {
        const s = get()
        if (!s.compare || !s.selected) return
        set({ selected: s.compare, compare: s.selected })
      },

      setHover: (hoverIso3) => {
        if (get().hoverIso3 !== hoverIso3) set({ hoverIso3 })
      },
      setAutoRotate: (autoRotate) => set({ autoRotate }),
      setReducedMotion: (reducedMotion) => set(reducedMotion ? { reducedMotion, autoRotate: false } : { reducedMotion }),
      setIsTouch: (isTouch) => set(isTouch ? { isTouch, autoRotate: false } : { isTouch }),
      setCustomNetWorth: (usd) => {
        const s = get()
        const next: SubjectRef = { kind: 'custom', netWorthUsd: usd }
        const patch: Partial<WealthGlobeState> = { customNetWorth: usd }
        if (s.selected?.kind === 'custom') patch.selected = next
        if (s.compare?.kind === 'custom') patch.compare = next
        set(patch)
      },
      setQuery: (query) => set({ query }),
      setFramings: (framings) => set({ framings, geoReady: true }),
      flyTo: (lat, lng, altitude) => set({ cameraTarget: { lat, lng, altitude, nonce: ++nonce }, autoRotate: false }),
      setSheet: (sheet) => set({ sheet }),
    }),
    {
      name: 'wealth-globe',
      partialize: (s) => ({ customNetWorth: s.customNetWorth }),
    },
  ),
)

export function useSelectedKey(): string | null {
  return useStore((s) => (s.selected ? refKey(s.selected) : null))
}
