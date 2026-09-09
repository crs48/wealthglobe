import { Suspense, lazy, useEffect, useRef } from 'react'
import { Inspector } from './components/Inspector'
import { Legend } from './components/Legend'
import { Footer } from './components/Footer'
import { MobileSheet } from './components/MobileSheet'
import { MobileChrome, TopChrome } from './components/TopChrome'
import { useMediaQuery } from './lib/hooks'
import { parseRefKey, refKey } from './lib/subjects'
import { useStore } from './store'

// three.js and the globe are the bulk of the bundle; let the chrome paint first.
const GlobeView = lazy(() => import('./components/GlobeView').then((m) => ({ default: m.GlobeView })))

function GlobeFallback() {
  return (
    <div className="absolute inset-0 flex items-center justify-center" aria-hidden>
      <div className="h-40 w-40 animate-pulse rounded-full border border-line-2 bg-panel-2/40" />
    </div>
  )
}

function useEnvironment() {
  const setReducedMotion = useStore((s) => s.setReducedMotion)
  const setIsTouch = useStore((s) => s.setIsTouch)
  const reduced = useMediaQuery('(prefers-reduced-motion: reduce)')
  const coarse = useMediaQuery('(pointer: coarse)')
  useEffect(() => setReducedMotion(reduced), [reduced, setReducedMotion])
  useEffect(() => setIsTouch(coarse), [coarse, setIsTouch])
}

/** Keep the selected subject in the URL hash so a view can be shared. */
function useHashSync() {
  const select = useStore((s) => s.select)
  const geoReady = useStore((s) => s.geoReady)
  const selected = useStore((s) => s.selected)
  const compare = useStore((s) => s.compare)

  // Capture the hash once, before any render can rewrite it.
  const initialHash = useRef<string | null>(null)
  if (initialHash.current === null) initialHash.current = decodeURIComponent(window.location.hash.replace(/^#/, ''))

  useEffect(() => {
    if (!geoReady) return
    const raw = initialHash.current
    initialHash.current = ''
    if (!raw) return
    const [a, b] = raw.split('|')
    const refA = a ? parseRefKey(a) : null
    const refB = b ? parseRefKey(b) : null
    if (refA) select(refA)
    if (refA && refB) useStore.setState({ compare: refB })
  }, [geoReady, select])

  useEffect(() => {
    if (!geoReady) return
    const parts = [selected ? refKey(selected) : null, compare ? refKey(compare) : null].filter(Boolean)
    const next = parts.length ? `#${parts.join('|')}` : ''
    if (window.location.hash !== next) history.replaceState(null, '', `${window.location.pathname}${window.location.search}${next}`)
  }, [selected, compare, geoReady])
}

function useKeyboard() {
  const clearSelection = useStore((s) => s.clearSelection)
  const cancelCompare = useStore((s) => s.cancelCompare)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      const t = e.target as HTMLElement | null
      if (t && (t.tagName === 'INPUT' || t.tagName === 'SELECT')) return
      const s = useStore.getState()
      if (s.comparePending) cancelCompare()
      else if (s.selected) clearSelection()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [clearSelection, cancelCompare])
}

export default function App() {
  useEnvironment()
  useHashSync()
  useKeyboard()
  const isMobile = useMediaQuery('(max-width: 820px)')
  const comparePending = useStore((s) => s.comparePending)

  return (
    <main className="relative h-full w-full overflow-hidden bg-ink">
      <Suspense fallback={<GlobeFallback />}>
        <GlobeView />
      </Suspense>
      {comparePending && (
        <div className="pointer-events-none absolute top-1/2 left-1/2 z-20 -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan/60 bg-panel/90 px-4 py-2 text-sm text-cyan shadow-panel" role="status">
          Pick a second subject on the globe or in a list
        </div>
      )}
      {isMobile ? (
        <>
          <MobileChrome />
          <MobileSheet />
        </>
      ) : (
        <>
          <TopChrome />
          <Inspector />
          <div className="absolute bottom-4 left-5 z-20 flex w-[340px] flex-col gap-3">
            <Legend />
            <Footer />
          </div>
        </>
      )}
    </main>
  )
}
