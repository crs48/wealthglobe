import { formatDistance } from '../lib/allocation'

export interface Plot {
  sideM: number
  color: string
  label: string
}

interface RefShape {
  label: string
  w: number
  h: number
}

/** Familiar rectangles, metres, smallest first. */
const SHAPES: RefShape[] = [
  { label: 'a sheet of A4 paper', w: 0.297, h: 0.21 },
  { label: 'a doormat', w: 0.75, h: 0.45 },
  { label: 'a double bed', w: 2.0, h: 1.5 },
  { label: 'a parking space', w: 5, h: 2.5 },
  { label: 'a city bus', w: 12, h: 2.55 },
  { label: 'a tennis court', w: 23.77, h: 10.97 },
  { label: 'a basketball court', w: 28, h: 15 },
  { label: 'a football pitch', w: 105, h: 68 },
  { label: 'a Manhattan block', w: 274, h: 80 },
  { label: 'the Great Pyramid’s base', w: 230, h: 230 },
  { label: 'Vatican City', w: 1050, h: 850 },
  { label: 'Central Park', w: 4000, h: 800 },
]

/** Smallest familiar rectangle that contains the plot on both sides. */
function pickShape(maxSideM: number): RefShape {
  for (const s of SHAPES) if (Math.min(s.w, s.h) >= maxSideM * 1.08) return s
  return SHAPES[SHAPES.length - 1]
}

/**
 * The magnified inset for claims under 1 km²: each plot drawn as a square to
 * scale against a familiar rectangle.
 */
export function PlotInset({ plots }: { plots: Plot[] }) {
  if (plots.length === 0) return null
  const maxSide = Math.max(...plots.map((p) => p.sideM))
  const shape = pickShape(maxSide)
  const W = 320
  const H = 190
  const pad = 18
  const scale = Math.min((W - pad * 2) / Math.max(shape.w, maxSide), (H - pad * 2 - 22) / Math.max(shape.h, maxSide))
  const sw = shape.w * scale
  const sh = shape.h * scale
  const ox = (W - sw) / 2
  const oy = pad + 4

  return (
    <figure className="rounded-lg border border-line bg-panel-2/70 p-2">
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label={`${plots.map((p) => `${p.label}: a square ${formatDistance(p.sideM / 1000)} on a side`).join('; ')}, drawn against ${shape.label}.`}>
        <rect x={ox} y={oy} width={sw} height={sh} fill="none" stroke="#5a6780" strokeDasharray="4 3" strokeWidth="1" />
        <text x={ox + 4} y={oy + sh + 14} fill="#8592a8" fontSize="10" fontFamily="var(--font-sans)">
          {shape.label} · {formatDistance(shape.w / 1000)} × {formatDistance(shape.h / 1000)}
        </text>
        {plots.map((p, i) => {
          const s = Math.max(1.5, p.sideM * scale)
          const x = ox + 6 + i * 10
          const y = oy + sh - 6 - s
          return (
            <g key={p.label + i}>
              <rect x={x} y={y} width={s} height={s} fill={p.color} fillOpacity={0.85} stroke={p.color} strokeWidth="1" />
              {plots.length === 1 && (
                <text x={Math.min(W - 4, x + s + 8)} y={Math.max(oy + 10, y + Math.min(s / 2, 14))} fill={p.color} fontSize="11" fontWeight="600" fontFamily="var(--font-mono)" textAnchor={x + s + 8 > W - 90 ? 'end' : 'start'}>
                  {formatDistance(p.sideM / 1000)} × {formatDistance(p.sideM / 1000)}
                </text>
              )}
            </g>
          )
        })}
      </svg>
      <figcaption className="mt-1 text-[11px] leading-snug text-fog">
        {plots.length === 1
          ? `This plot is a square ${formatDistance(plots[0].sideM / 1000)} on a side, shown against ${shape.label}.`
          : plots.map((p) => `${p.label}: ${formatDistance(p.sideM / 1000)} square`).join(' · ') + `, against ${shape.label}.`}
      </figcaption>
    </figure>
  )
}
