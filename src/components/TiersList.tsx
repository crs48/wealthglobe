import { META } from '../data/meta'
import { TIERS } from '../data/tiers'
import { EARTH_LAND_KM2, formatArea, formatBigCount } from '../lib/allocation'
import { listKeyHandler } from '../lib/hooks'
import { refKey } from '../lib/subjects'
import { useStore } from '../store'

/** The UBS pyramid, drawn as paired bars: share of adults vs share of wealth (= land). */
export function TierBars({ interactive = true }: { interactive?: boolean }) {
  const select = useStore((s) => s.select)
  const selected = useStore((s) => s.selected)
  const selectedKey = selected ? refKey(selected) : null

  return (
    <ul role="list" aria-label="Wealth tiers" onKeyDown={listKeyHandler} className="flex flex-col gap-1.5">
      {TIERS.map((t) => {
        const key = `tier:${t.id}`
        const land = t.wealthShare * EARTH_LAND_KM2
        const body = (
          <>
            <span className="flex items-baseline justify-between gap-2">
              <span className="text-sm text-snow">
                {t.label} <span className="num text-xs text-fog">{t.range}</span>
              </span>
              <span className="num text-xs text-mist">{formatArea(land)}</span>
            </span>
            <span className="mt-1.5 block">
              <span className="flex items-center gap-2 text-[10px] text-fog">
                <span className="w-10 shrink-0">adults</span>
                <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-panel-3">
                  <span className="block h-full rounded-full bg-mist/60" style={{ width: `${t.adultShare * 100}%` }} />
                </span>
                <span className="num w-10 shrink-0 text-right">{(t.adultShare * 100).toFixed(1)}%</span>
              </span>
              <span className="mt-1 flex items-center gap-2 text-[10px] text-fog">
                <span className="w-10 shrink-0">land</span>
                <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-panel-3">
                  <span className="block h-full rounded-full" style={{ width: `${Math.max(1, t.wealthShare * 100)}%`, background: t.color }} />
                </span>
                <span className="num w-10 shrink-0 text-right">{(t.wealthShare * 100).toFixed(1)}%</span>
              </span>
            </span>
          </>
        )
        return (
          <li key={t.id}>
            {interactive ? (
              <button type="button" data-row className="row-btn flex-col items-stretch" aria-current={selectedKey === key} onClick={() => select({ kind: 'tier', id: t.id })}>
                {body}
              </button>
            ) : (
              <div className="px-3 py-2">{body}</div>
            )}
          </li>
        )
      })}
    </ul>
  )
}

export function TiersList() {
  return (
    <div className="flex flex-col gap-3">
      <p className="text-[11px] leading-snug text-fog">
        {META.wealthVintage}. {formatBigCount(META.worldAdults)} adults in the sample. Because the rule divides land by wealth, a tier’s share of land equals its share of wealth. Select a tier to shade the globe with the countries it would hold.
      </p>
      <TierBars />
    </div>
  )
}
