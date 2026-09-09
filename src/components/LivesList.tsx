import { GitCompareArrows } from 'lucide-react'
import { PERSONAS, PERSONA_GROUPS, PERSONA_PAIRS, type Persona } from '../data/personas'
import { formatArea, formatUsd } from '../lib/allocation'
import { listKeyHandler } from '../lib/hooks'
import { refKey, resolveSubject } from '../lib/subjects'
import { useStore } from '../store'

function PersonaRow({ p, selectedKey }: { p: Persona; selectedKey: string | null }) {
  const select = useStore((s) => s.select)
  const framings = useStore((s) => s.framings)
  const r = resolveSubject({ kind: 'persona', id: p.id }, framings)
  if (!r) return null
  const key = `persona:${p.id}`
  return (
    <li>
      <button type="button" data-row className="row-btn" aria-current={selectedKey === key} onClick={() => select({ kind: 'persona', id: p.id })}>
        <span className="min-w-0">
          <span className="block truncate text-sm text-snow">{p.label}</span>
          <span className="block truncate text-[11px] text-fog">
            {p.sublabel}
            {p.proxyNote ? ' · proxy' : ''}
          </span>
        </span>
        <span className="num shrink-0 text-right">
          <span className="block text-sm text-mist">{formatArea(r.claimKm2)}</span>
          <span className="block text-[11px] text-fog">{formatUsd(r.netWorthUsd, { compact: r.netWorthUsd >= 1e6 })}</span>
        </span>
      </button>
    </li>
  )
}

function PairCard({ id }: { id: string }) {
  const pair = PERSONA_PAIRS.find((p) => p.id === id)!
  const selectPair = useStore((s) => s.selectPair)
  const selected = useStore((s) => s.selected)
  const compare = useStore((s) => s.compare)
  const framings = useStore((s) => s.framings)
  const a = resolveSubject({ kind: 'persona', id: pair.a }, framings)
  const b = resolveSubject({ kind: 'persona', id: pair.b }, framings)
  if (!a || !b) return null
  const active = selected && compare && refKey(selected) === `persona:${pair.a}` && refKey(compare) === `persona:${pair.b}`
  return (
    <li>
      <button type="button" data-row className="row-btn flex-col items-stretch gap-1.5" aria-current={!!active} onClick={() => selectPair(pair.id)}>
        <span className="flex items-center justify-between gap-2">
          <span className="truncate text-sm text-snow">{pair.label}</span>
          <GitCompareArrows className="h-3.5 w-3.5 shrink-0 text-cyan" aria-hidden />
        </span>
        <span className="block text-[11px] text-fog">{pair.sublabel}</span>
        <span className="grid grid-cols-2 gap-2 text-xs">
          <span>
            <span className="block text-fog">Median</span>
            <span className="num block text-gold-2">{formatArea(a.claimKm2)}</span>
          </span>
          <span>
            <span className="block text-fog">Mean</span>
            <span className="num block text-cyan">{formatArea(b.claimKm2)}</span>
          </span>
        </span>
      </button>
    </li>
  )
}

export function LivesList() {
  const selected = useStore((s) => s.selected)
  const selectedKey = selected ? refKey(selected) : null

  return (
    <div className="flex flex-col gap-4" role="list" aria-label="Curated lives" onKeyDown={listKeyHandler}>
      <p className="text-[11px] leading-snug text-fog">
        Chosen so the range is felt, not just read. Every card names the statistic it uses; proxies say so.
      </p>
      {PERSONA_GROUPS.map((g) => {
        const personas = g.id === 'gap' ? [] : PERSONAS.filter((p) => p.group === g.id)
        const pairs = PERSONA_PAIRS.filter((p) => p.group === g.id)
        if (personas.length === 0 && pairs.length === 0) return null
        return (
          <section key={g.id} aria-labelledby={`lives-${g.id}`}>
            <h3 id={`lives-${g.id}`} className="sticky top-[42px] z-10 bg-panel/95 py-1 text-[11px] font-semibold tracking-wider text-fog uppercase backdrop-blur">
              {g.label}
            </h3>
            <ul className="mt-1 flex flex-col">
              {personas.map((p) => (
                <PersonaRow key={p.id} p={p} selectedKey={selectedKey} />
              ))}
              {pairs.map((p) => (
                <PairCard key={p.id} id={p.id} />
              ))}
            </ul>
          </section>
        )
      })}
    </div>
  )
}
