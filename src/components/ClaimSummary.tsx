import { GitCompareArrows, X } from 'lucide-react'
import { CONFIDENCE_HELP } from '../data/meta'
import { RICHEST } from '../data/richest'
import { STAT_LABEL, type ResolvedSubject } from '../lib/subjects'
import {
  describeArea,
  formatArea,
  formatAreaParts,
  formatAreaTriple,
  formatBigCount,
  formatDistance,
  formatRatio,
  formatShare,
  formatUsd,
  landClaimKm2,
  landShare,
  squareSideM,
} from '../lib/allocation'
import { COMPARE } from '../lib/colors'
import { useResolved } from '../lib/hooks'
import { useStore } from '../store'
import { PlotInset } from './PlotInset'
import { CompareBar } from './CompareBar'

const CONF_STYLE: Record<ResolvedSubject['source']['confidence'], string> = {
  'official-ubs': 'border-moss/60 text-moss',
  'databook-estimate': 'border-sea/70 text-[#8fb4f0]',
  'regional-proxy': 'border-gold/60 text-gold',
}

function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="min-w-0">
      <dt className="text-[11px] tracking-wide text-fog uppercase">{label}</dt>
      <dd className="num truncate text-sm text-snow" title={hint}>
        {value}
      </dd>
    </div>
  )
}

export function ClaimSummary({ subject }: { subject: ResolvedSubject }) {
  const compareRef = useStore((s) => s.compare)
  const comparePending = useStore((s) => s.comparePending)
  const startCompare = useStore((s) => s.startCompare)
  const cancelCompare = useStore((s) => s.cancelCompare)
  const clearSelection = useStore((s) => s.clearSelection)
  const select = useStore((s) => s.select)
  const cmp = useResolved(compareRef, COMPARE)

  const parts = formatAreaParts(subject.claimKm2)
  const triple = formatAreaTriple(subject.claimKm2)
  const size = describeArea(subject.claimKm2)
  const share = landShare(subject.claimKm2)
  const plots = [subject, cmp].filter((s): s is ResolvedSubject => !!s && s.isTiny).map((s) => ({ sideM: squareSideM(s.claimKm2), color: s.color, label: s.label }))
  const isTier = subject.kind === 'tier' && subject.tier

  return (
    <section aria-labelledby="claim-title" className="flex flex-col gap-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-medium tracking-wider text-gold uppercase">{subject.eyebrow}</p>
          <h2 id="claim-title" className="mt-0.5 text-xl leading-tight font-semibold text-snow">
            {subject.label}
          </h2>
          <p className="mt-0.5 text-sm text-mist">{subject.sublabel}</p>
        </div>
        <button type="button" className="rounded-md p-1 text-fog hover:text-snow" aria-label="Clear selection" onClick={clearSelection}>
          <X className="h-4 w-4" />
        </button>
      </div>

      <div>
        <p className="text-[11px] tracking-wide text-fog uppercase">{isTier ? 'Joint land claim' : 'Land claim'}</p>
        <p className="num mt-1 text-5xl leading-none font-medium tracking-tight" style={{ color: subject.color }}>
          {parts.value}
          <span className="ml-1.5 text-2xl text-mist">{parts.unit}</span>
        </p>
        <p className="num mt-2 text-xs text-fog">
          {triple.km2} km² · {triple.ha} ha · {triple.m2} m²
        </p>
        <p className="mt-2 text-sm leading-snug text-mist">
          {formatShare(share)}. {size.text.charAt(0).toUpperCase() + size.text.slice(1)}.
        </p>
      </div>

      {plots.length > 0 && !isTier && <PlotInset plots={plots} />}

      <dl className="grid grid-cols-2 gap-x-4 gap-y-3">
        <Stat label={isTier ? 'Joint net worth' : 'Net worth used'} value={formatUsd(subject.netWorthUsd, { compact: subject.netWorthUsd >= 1e6 })} />
        {subject.isTiny ? (
          <Stat label="Square plot" value={`${formatDistance(squareSideM(subject.claimKm2) / 1000)} a side`} />
        ) : (
          <Stat label="Circle diameter" value={formatDistance(subject.radiusKm * 2)} />
        )}
        {isTier && subject.tier && (
          <>
            <Stat label="Adults in tier" value={`${formatBigCount(subject.tier.adults)} (${(subject.tier.adultShare * 100).toFixed(1)}%)`} />
            <Stat label="Mean per adult" value={formatUsd(subject.netWorthUsd / subject.tier.adults, { compact: true })} />
          </>
        )}
        {subject.country && (
          <>
            <Stat label="Adults" value={`${formatBigCount(subject.country.adults)}`} />
            <Stat label="Land area" value={formatArea(subject.country.landKm2)} />
            {RICHEST[subject.country.iso3] ? (
              <Stat
                label="Wealthiest individual"
                value={`${formatUsd(RICHEST[subject.country.iso3].wealthUsd, { compact: true })} → ${formatArea(landClaimKm2(RICHEST[subject.country.iso3].wealthUsd))}`}
                hint={`${RICHEST[subject.country.iso3].name}, Forbes list`}
              />
            ) : (
              <Stat label="Wealthiest individual" value="none on Forbes list" hint="No citizen of this country appears on the Forbes billionaire list." />
            )}
          </>
        )}
      </dl>

      {isTier && subject.tierFill && (
        <div className="rounded-lg border border-line bg-panel-2/70 p-3 text-sm leading-snug text-mist">
          Together this tier would hold roughly{' '}
          <span className="text-snow">{subject.tierFill.countries.map((c) => (c.iso3 === 'USA' ? 'the United States' : c.name)).join(', ')}</span>
          {subject.tierFill.remainderKm2 > subject.claimKm2 * 0.03 && <> and another {formatArea(subject.tierFill.remainderKm2)}</>}. The globe shades those countries.
        </div>
      )}

      {subject.alt && subject.stat && subject.ref.kind !== 'tier' && (
        <div className="rounded-lg border border-line bg-panel-2/70 p-3">
          <div className="flex items-baseline justify-between gap-2 text-sm">
            <span className="text-fog">{STAT_LABEL[subject.stat]}</span>
            <span className="num text-snow">
              {formatUsd(subject.netWorthUsd)} → {formatArea(subject.claimKm2)}
            </span>
          </div>
          <div className="mt-1 flex items-baseline justify-between gap-2 text-sm">
            <span className="text-fog">{STAT_LABEL[subject.alt.stat]}</span>
            <span className="num text-mist">
              {formatUsd(subject.alt.netWorthUsd)} → {formatArea(subject.alt.claimKm2)}
            </span>
          </div>
          <p className="mt-2 text-xs leading-snug text-fog">
            Mean ÷ median is{' '}
            <span className="num text-mist">
              {formatRatio(Math.max(subject.netWorthUsd, subject.alt.netWorthUsd) / Math.min(subject.netWorthUsd, subject.alt.netWorthUsd))}
            </span>
            . The mean is pulled up by the wealthiest households; the median is the person in the middle. A wide gap means wealth is concentrated.
          </p>
          {subject.ref.kind === 'country' && (
            <button
              type="button"
              className="mt-2 text-xs font-medium text-gold hover:underline"
              onClick={() => select({ kind: 'country', iso3: subject.iso3!, stat: subject.alt!.stat }, { fly: false })}
            >
              Show the {STAT_LABEL[subject.alt.stat].toLowerCase()} instead
            </button>
          )}
        </div>
      )}

      {subject.note && <p className="rounded-lg border border-gold/40 bg-gold/5 p-3 text-xs leading-snug text-gold-2">{subject.note}</p>}

      <div className="flex flex-wrap items-center gap-2 text-xs text-fog">
        <span className={`chip ${CONF_STYLE[subject.source.confidence]}`} title={CONFIDENCE_HELP[subject.source.confidence]}>
          {subject.source.confidenceLabel}
        </span>
        <span>
          {subject.source.label} · {subject.source.vintage}
        </span>
        {subject.cameraLabel && <span>· camera: {subject.cameraLabel}</span>}
      </div>

      {!isTier && (
        <div className="flex flex-wrap items-center gap-2">
          {comparePending ? (
            <button type="button" className="inline-flex items-center gap-1.5 rounded-full border border-cyan/60 px-3 py-1.5 text-xs font-medium text-cyan" onClick={cancelCompare}>
              <GitCompareArrows className="h-3.5 w-3.5" /> Pick a second subject… (cancel)
            </button>
          ) : (
            <button type="button" className="inline-flex items-center gap-1.5 rounded-full border border-line-2 px-3 py-1.5 text-xs font-medium text-mist hover:border-cyan hover:text-cyan" onClick={startCompare}>
              <GitCompareArrows className="h-3.5 w-3.5" /> {cmp ? 'Replace comparison' : 'Compare with…'}
            </button>
          )}
        </div>
      )}

      {cmp && !isTier && <CompareBar a={subject} b={cmp} />}
    </section>
  )
}
