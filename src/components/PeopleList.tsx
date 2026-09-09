import { META } from '../data/meta'
import { PEOPLE } from '../data/people'
import { formatArea, formatUsd, landClaimKm2 } from '../lib/allocation'
import { listKeyHandler } from '../lib/hooks'
import { refKey } from '../lib/subjects'
import { useStore } from '../store'
import { CustomNetWorth } from './CustomNetWorth'

export function PeopleList() {
  const select = useStore((s) => s.select)
  const selected = useStore((s) => s.selected)
  const selectedKey = selected ? refKey(selected) : null

  return (
    <div className="flex flex-col gap-3">
      <CustomNetWorth />
      <p className="text-[11px] text-fog">{META.billionaireVintage}. These figures move daily with share prices.</p>
      <ul role="list" aria-label="Named fortunes" onKeyDown={listKeyHandler} className="flex flex-col">
        {PEOPLE.map((p, i) => {
          const key = `person:${p.id}`
          return (
            <li key={p.id}>
              <button type="button" data-row className="row-btn" aria-current={selectedKey === key} onClick={() => select({ kind: 'person', id: p.id })}>
                <span className="flex min-w-0 items-center gap-3">
                  <span className="num w-5 shrink-0 text-right text-xs text-fog">{i + 1}</span>
                  <span className="min-w-0">
                    <span className="block truncate text-sm text-snow">{p.name}</span>
                    <span className="block truncate text-[11px] text-fog">
                      {p.role} · {p.place}
                    </span>
                  </span>
                </span>
                <span className="num shrink-0 text-right">
                  <span className="block text-sm text-gold-2">{formatUsd(p.wealthUsd, { compact: true })}</span>
                  <span className="block text-[11px] text-fog">{formatArea(landClaimKm2(p.wealthUsd))}</span>
                </span>
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
