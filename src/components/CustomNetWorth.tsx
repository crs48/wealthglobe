import { useState } from 'react'
import { MapPin } from 'lucide-react'
import { formatArea, landClaimKm2 } from '../lib/allocation'
import { useStore } from '../store'

const nf = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 })

function parseUsd(raw: string): number | null {
  const s = raw.trim().toLowerCase().replace(/[$,\s]/g, '')
  if (!s) return null
  const m = s.match(/^(\d+(?:\.\d+)?)([kmbt])?$/)
  if (!m) return null
  const mult = { k: 1e3, m: 1e6, b: 1e9, t: 1e12 }[m[2] as 'k' | 'm' | 'b' | 't'] ?? 1
  const n = parseFloat(m[1]) * mult
  return Number.isFinite(n) && n > 0 ? n : null
}

/** The persistent "your net worth" input. The last value survives reloads. */
export function CustomNetWorth({ compact = false }: { compact?: boolean }) {
  const customNetWorth = useStore((s) => s.customNetWorth)
  const setCustomNetWorth = useStore((s) => s.setCustomNetWorth)
  const select = useStore((s) => s.select)
  const selected = useStore((s) => s.selected)
  const [raw, setRaw] = useState(nf.format(customNetWorth))
  const [invalid, setInvalid] = useState(false)
  // Re-sync the text when the stored value changes elsewhere (adjusting
  // state during render, per React's guidance, rather than in an effect).
  const [synced, setSynced] = useState(customNetWorth)
  if (synced !== customNetWorth) {
    setSynced(customNetWorth)
    setRaw(nf.format(customNetWorth))
  }

  const isActive = selected?.kind === 'custom'
  const claim = landClaimKm2(customNetWorth)

  function commit(place: boolean) {
    const n = parseUsd(raw)
    if (n === null) {
      setInvalid(true)
      return
    }
    setInvalid(false)
    setCustomNetWorth(n)
    if (place) select({ kind: 'custom', netWorthUsd: n })
  }

  return (
    <form
      className={`flex items-center gap-2 ${compact ? '' : 'rounded-lg border border-line bg-panel-2/70 p-2'}`}
      onSubmit={(e) => {
        e.preventDefault()
        commit(true)
      }}
    >
      <label className="flex min-w-0 flex-1 items-center gap-2">
        <span className="shrink-0 text-xs text-fog">Your net worth</span>
        <span className="relative min-w-0 flex-1">
          <span className="pointer-events-none absolute top-1/2 left-2 -translate-y-1/2 text-xs text-fog">$</span>
          <input
            inputMode="decimal"
            aria-label="Your net worth in US dollars"
            aria-invalid={invalid}
            className={`field num py-1 pl-5 text-xs ${invalid ? 'border-red-400' : ''}`}
            value={raw}
            onChange={(e) => {
              setRaw(e.target.value)
              setInvalid(false)
            }}
            onBlur={() => commit(false)}
            placeholder="50,000 or 2.5M"
          />
        </span>
      </label>
      <span className="num hidden shrink-0 text-xs text-mist sm:inline">{formatArea(claim)}</span>
      <button
        type="submit"
        className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${isActive ? 'bg-gold text-ink' : 'border border-line-2 text-mist hover:border-gold hover:text-gold'}`}
      >
        <MapPin className="h-3 w-3" aria-hidden /> Place me
      </button>
    </form>
  )
}
