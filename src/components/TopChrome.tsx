import { Pause, Play } from 'lucide-react'
import { useStore, type Mode } from '../store'
import { Search } from './Search'

const MODES: { id: Mode; label: string; hint: string }[] = [
  { id: 'median', label: 'Typical person', hint: 'Median adult: half hold more, half hold less' },
  { id: 'mean', label: 'Average person', hint: 'Mean adult: total wealth ÷ adults' },
  { id: 'named', label: 'Named fortunes', hint: 'The billionaire snapshot' },
]

export function ModeToggle({ className = '' }: { className?: string }) {
  const mode = useStore((s) => s.mode)
  const setMode = useStore((s) => s.setMode)
  return (
    <div className={`segment ${className}`} role="group" aria-label="Statistic">
      {MODES.map((m) => (
        <button key={m.id} type="button" aria-pressed={mode === m.id} title={m.hint} onClick={() => setMode(m.id)}>
          {m.label}
        </button>
      ))}
    </div>
  )
}

export function AutoRotateButton({ className = '' }: { className?: string }) {
  const autoRotate = useStore((s) => s.autoRotate)
  const setAutoRotate = useStore((s) => s.setAutoRotate)
  const reducedMotion = useStore((s) => s.reducedMotion)
  if (reducedMotion) return null
  return (
    <button
      type="button"
      className={`inline-flex items-center gap-1.5 rounded-full border border-line bg-panel-2/80 px-3 py-1 text-xs text-fog hover:text-snow ${className}`}
      aria-pressed={autoRotate}
      onClick={() => setAutoRotate(!autoRotate)}
    >
      {autoRotate ? <Pause className="h-3 w-3" aria-hidden /> : <Play className="h-3 w-3" aria-hidden />}
      {autoRotate ? 'Rotating' : 'Rotate'}
    </button>
  )
}

export function TopChrome() {
  return (
    <header className="pointer-events-none absolute top-0 left-0 z-20 flex max-w-xl flex-col gap-3 p-5">
      <div className="pointer-events-auto">
        <h1 className="text-2xl font-semibold tracking-tight text-snow">
          Wealth <span className="text-gold">Globe</span>
        </h1>
        <p className="mt-1 max-w-md text-sm leading-snug text-mist">
          If every square meter of Earth’s land were divided in proportion to personal net worth, how much ground would one person stand on?
        </p>
      </div>
      <div className="pointer-events-auto flex flex-wrap items-center gap-2">
        <ModeToggle />
        <AutoRotateButton />
      </div>
      <div className="pointer-events-auto">
        <Search />
      </div>
    </header>
  )
}

export function MobileChrome() {
  return (
    <header className="absolute top-0 right-0 left-0 z-20 flex flex-col gap-2 p-3 pt-[max(0.75rem,env(safe-area-inset-top))]">
      <div className="flex items-center gap-2">
        <h1 className="shrink-0 text-lg font-semibold tracking-tight whitespace-nowrap text-snow">
          Wealth <span className="text-gold">Globe</span>
        </h1>
        <div className="min-w-0 flex-1">
          <Search compact />
        </div>
      </div>
      <ModeToggle className="self-start" />
    </header>
  )
}
