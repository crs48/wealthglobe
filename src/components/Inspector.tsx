import { META } from '../data/meta'
import { GOLD } from '../lib/colors'
import { useResolved } from '../lib/hooks'
import { useStore, type Tab } from '../store'
import { ClaimSummary } from './ClaimSummary'
import { CustomNetWorth } from './CustomNetWorth'
import { LivesList } from './LivesList'
import { PeopleList } from './PeopleList'
import { PlacesList } from './PlacesList'
import { TierBars, TiersList } from './TiersList'

const TABS: { id: Tab; label: string }[] = [
  { id: 'places', label: 'Places' },
  { id: 'people', label: 'People' },
  { id: 'lives', label: 'Lives' },
  { id: 'tiers', label: 'Tiers' },
]

function EmptyState() {
  return (
    <section aria-label="How the rule works" className="flex flex-col gap-4">
      <div>
        <p className="text-[11px] font-medium tracking-wider text-gold uppercase">The rule</p>
        <p className="mt-2 text-base leading-snug text-snow">
          Take Earth’s {'148.9'} million km² of land and hand it out in proportion to personal net worth.
        </p>
        <p className="mt-2 text-sm leading-snug text-mist">
          A person’s plot is their net worth divided by the {'$518'} trillion the UBS sample tracks, times all the land. Every square meter counts the same, so this is about area, not value.
        </p>
        <p className="mt-2 text-sm leading-snug text-mist">Pick a country on the globe, a life, or a named fortune. Then compare two.</p>
      </div>
      <div>
        <p className="mb-1.5 text-[11px] tracking-wide text-fog uppercase">Who holds the land</p>
        <TierBars />
      </div>
    </section>
  )
}

export function InspectorBody() {
  const selected = useStore((s) => s.selected)
  const tab = useStore((s) => s.tab)
  const setTab = useStore((s) => s.setTab)
  const subject = useResolved(selected, GOLD)

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="border-b border-line px-4 pt-4 pb-4">{subject ? <ClaimSummary subject={subject} /> : <EmptyState />}</div>
        <div className="panel-glass sticky top-0 z-20 border-b border-line px-2" role="tablist" aria-label="Inspector sections">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              role="tab"
              id={`tab-${t.id}`}
              aria-selected={tab === t.id}
              aria-controls={`panel-${t.id}`}
              className={`px-3 py-2.5 text-sm font-medium transition-colors ${tab === t.id ? 'border-b-2 border-gold text-snow' : 'text-fog hover:text-mist'}`}
              onClick={() => setTab(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div id={`panel-${tab}`} role="tabpanel" aria-labelledby={`tab-${tab}`} className="px-3 py-3">
          {tab === 'places' && <PlacesList />}
          {tab === 'people' && <PeopleList />}
          {tab === 'lives' && <LivesList />}
          {tab === 'tiers' && <TiersList />}
        </div>
      </div>
      {tab !== 'people' && (
        <div className="shrink-0 border-t border-line px-3 py-2">
          <CustomNetWorth compact />
        </div>
      )}
      <p className="shrink-0 border-t border-line px-4 py-2 text-[10.5px] leading-snug text-fog">
        {META.wealthVintage} ({META.ubsMarkets} markets, ~{Math.round(META.sampleCoverage * 100)}% of world wealth) · {META.databookVintage} for the rest · area ≠ value · billionaire numbers move daily.
      </p>
    </div>
  )
}

export function Inspector() {
  return (
    <aside className="panel-glass absolute top-4 right-4 bottom-4 z-20 w-[400px] overflow-hidden rounded-2xl border border-line shadow-panel" aria-label="Inspector">
      <InspectorBody />
    </aside>
  )
}
