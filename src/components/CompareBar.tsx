import { ArrowLeftRight, X } from 'lucide-react'
import { formatArea, formatRatio } from '../lib/allocation'
import type { ResolvedSubject } from '../lib/subjects'
import { useStore } from '../store'

export function CompareBar({ a, b }: { a: ResolvedSubject; b: ResolvedSubject }) {
  const swapCompare = useStore((s) => s.swapCompare)
  const clearCompare = useStore((s) => s.clearCompare)
  const ratio = a.claimKm2 / b.claimKm2
  const bigger = ratio >= 1 ? a : b
  const smaller = ratio >= 1 ? b : a
  const r = Math.max(ratio, 1 / ratio)
  const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)
  const subjectPlot = bigger.phrase === 'your' ? 'Your plot' : cap(`${bigger.phrase}’s plot`)
  const objectPlot = smaller.phrase === 'your' ? 'yours' : `${smaller.phrase}’s`

  return (
    <div className="rounded-lg border border-cyan/40 bg-panel-2/70 p-3" aria-live="polite">
      <div className="flex items-center justify-between gap-2">
        <p className="text-[11px] font-medium tracking-wider text-cyan uppercase">Comparison</p>
        <div className="flex items-center gap-1">
          <button type="button" className="rounded p-1 text-fog hover:text-snow" aria-label="Swap subjects" onClick={swapCompare}>
            <ArrowLeftRight className="h-3.5 w-3.5" />
          </button>
          <button type="button" className="rounded p-1 text-fog hover:text-snow" aria-label="Remove comparison" onClick={clearCompare}>
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
      <div className="mt-2 grid grid-cols-2 gap-3">
        {[a, b].map((s) => (
          <div key={s.key} className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: s.color }} aria-hidden />
              <span className="truncate text-xs text-mist">{s.label}</span>
            </div>
            <div className="num mt-0.5 text-base" style={{ color: s.color }}>
              {formatArea(s.claimKm2)}
            </div>
          </div>
        ))}
      </div>
      <p className="mt-2 text-sm leading-snug text-snow">
        {subjectPlot} is <span className="num text-gold-2">{formatRatio(r)}</span> {objectPlot}.
      </p>
      <div className="mt-2 flex h-1.5 w-full overflow-hidden rounded-full bg-panel-3" aria-hidden>
        <div style={{ width: `${(a.claimKm2 / (a.claimKm2 + b.claimKm2)) * 100}%`, background: a.color }} />
        <div className="flex-1" style={{ background: b.color }} />
      </div>
    </div>
  )
}
