import { formatArea, formatUsd, landClaimKm2 } from '../lib/allocation'
import { COLOR_METRIC_LABEL, RAMP_CSS, metricScale, type ColorMetric } from '../lib/colors'
import { useStore } from '../store'

const METRICS: ColorMetric[] = ['mean', 'median', 'claimMean', 'claimMedian']

function endLabel(metric: ColorMetric, value: number): { usd: string; area: string } {
  const isClaim = metric === 'claimMean' || metric === 'claimMedian'
  const usd = isClaim ? value / landClaimKm2(1) : value
  const km2 = isClaim ? value : landClaimKm2(value)
  return { usd: formatUsd(usd, { compact: usd >= 1e6 }), area: formatArea(km2) }
}

export function Legend({ className = '' }: { className?: string }) {
  const metric = useStore((s) => s.colorMetric)
  const setColorMetric = useStore((s) => s.setColorMetric)
  const scale = metricScale(metric)
  const lo = endLabel(metric, scale.min)
  const hi = endLabel(metric, scale.max)

  return (
    <div className={`panel-glass rounded-xl border border-line p-3 text-xs shadow-panel ${className}`}>
      <label className="flex items-center justify-between gap-2">
        <span className="text-fog">Countries colored by</span>
        <select
          className="rounded-md border border-line bg-panel-2 px-2 py-1 text-xs text-snow focus:border-gold focus:outline-none"
          value={metric}
          onChange={(e) => setColorMetric(e.target.value as ColorMetric)}
        >
          {METRICS.map((m) => (
            <option key={m} value={m}>
              {COLOR_METRIC_LABEL[m]}
            </option>
          ))}
        </select>
      </label>
      <div className="mt-2 h-2 w-full rounded-full" style={{ background: RAMP_CSS }} aria-hidden />
      <div className="mt-1.5 flex justify-between gap-4">
        <div className="num leading-tight">
          <div className="text-mist">{lo.usd}</div>
          <div className="text-fog">{lo.area}</div>
        </div>
        <div className="num text-right leading-tight">
          <div className="text-mist">{hi.usd}</div>
          <div className="text-fog">{hi.area}</div>
        </div>
      </div>
      <p className="mt-2 text-[11px] leading-snug text-fog">Log scale, per adult. Grey means no figure in the sample.</p>
    </div>
  )
}
