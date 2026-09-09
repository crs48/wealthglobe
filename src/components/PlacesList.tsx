import { useMemo, useState } from 'react'
import { COUNTRIES, type Country } from '../data/countries'
import { REGION_GROUPS } from '../data/regions'
import { formatArea, formatUsd, landClaimKm2 } from '../lib/allocation'
import { listKeyHandler } from '../lib/hooks'
import { refKey } from '../lib/subjects'
import { statForMode, useStore } from '../store'

export function PlacesList() {
  const mode = useStore((s) => s.mode)
  const select = useStore((s) => s.select)
  const selected = useStore((s) => s.selected)
  const setHover = useStore((s) => s.setHover)
  const [filter, setFilter] = useState('')
  const stat = statForMode(mode)
  const selectedKey = selected ? refKey(selected) : null

  const groups = useMemo(() => {
    const q = filter.trim().toLowerCase()
    const value = (c: Country) => (stat === 'mean' ? c.mean : (c.median ?? -1))
    return REGION_GROUPS.map((g) => ({
      group: g,
      rows: COUNTRIES.filter((c) => c.region === g.id && (!q || c.name.toLowerCase().includes(q))).sort((a, b) => value(b) - value(a)),
    })).filter((g) => g.rows.length > 0)
  }, [filter, stat])

  return (
    <div className="flex flex-col gap-3">
      <input
        type="search"
        className="field text-xs"
        placeholder="Filter countries"
        aria-label="Filter countries"
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
      />
      <p className="text-[11px] text-fog">
        Sorted by {stat === 'mean' ? 'mean' : 'median'} wealth per adult. Click a country to see its {stat}-adult claim.
      </p>
      <div role="list" aria-label="Countries by region" onKeyDown={listKeyHandler} className="flex flex-col gap-4">
        {groups.map(({ group, rows }) => (
          <section key={group.id} aria-labelledby={`region-${group.id}`}>
            <h3 id={`region-${group.id}`} className="sticky top-[42px] z-10 bg-panel/95 py-1 text-[11px] font-semibold tracking-wider text-fog uppercase backdrop-blur">
              {group.label} <span className="num font-normal">({rows.length})</span>
            </h3>
            <ul className="mt-1 flex flex-col">
              {rows.map((c) => {
                const v = stat === 'mean' ? c.mean : c.median
                const key = `country:${c.iso3}:${stat}`
                return (
                  <li key={c.iso3} role="listitem">
                    <button
                      type="button"
                      data-row
                      className="row-btn"
                      aria-current={selectedKey === key}
                      onClick={() => select({ kind: 'country', iso3: c.iso3, stat })}
                      onMouseEnter={() => setHover(c.iso3)}
                      onMouseLeave={() => setHover(null)}
                      onFocus={() => setHover(c.iso3)}
                      onBlur={() => setHover(null)}
                    >
                      <span className="min-w-0">
                        <span className="block truncate text-sm text-snow">{c.name}</span>
                        <span className="block text-[11px] text-fog">
                          {c.confidence === 'official-ubs' ? 'UBS 2026' : c.confidence === 'regional-proxy' ? 'proxy' : 'databook'}
                          {c.median === null && stat === 'median' ? ' · no median published' : ''}
                        </span>
                      </span>
                      <span className="num shrink-0 text-right">
                        <span className="block text-sm text-mist">{v === null ? '—' : formatUsd(v)}</span>
                        <span className="block text-[11px] text-fog">{v === null ? 'mean only' : formatArea(landClaimKm2(v))}</span>
                      </span>
                    </button>
                  </li>
                )
              })}
            </ul>
          </section>
        ))}
        {groups.length === 0 && <p className="text-sm text-fog">No country matches “{filter}”.</p>}
      </div>
    </div>
  )
}
