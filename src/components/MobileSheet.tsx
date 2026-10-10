import { useEffect, useState } from 'react'
import { motion, useMotionValue, animate, type PanInfo } from 'framer-motion'
import { useStore, type SheetSnap } from '../store'
import { InspectorBody } from './Inspector'

const PEEK = 112

function snapY(snap: SheetSnap, h: number): number {
  switch (snap) {
    case 'peek':
      return h - PEEK
    case 'half':
      return Math.round(h * 0.48)
    case 'full':
      return Math.round(h * 0.1)
  }
}

/** Bottom sheet with three snap points. Content stays real DOM for screen readers. */
export function MobileSheet() {
  const sheet = useStore((s) => s.sheet)
  const setSheet = useStore((s) => s.setSheet)
  const reducedMotion = useStore((s) => s.reducedMotion)
  const [h, setH] = useState(() => window.innerHeight)
  const y = useMotionValue(snapY(sheet, h))

  useEffect(() => {
    const onResize = () => setH(window.innerHeight)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  useEffect(() => {
    const target = snapY(sheet, h)
    if (reducedMotion) y.set(target)
    else animate(y, target, { type: 'spring', stiffness: 380, damping: 38 })
  }, [sheet, h, y, reducedMotion])

  function onDragEnd(_: unknown, info: PanInfo) {
    const current = y.get() + info.velocity.y * 0.15
    const snaps: SheetSnap[] = ['full', 'half', 'peek']
    let best: SheetSnap = 'half'
    let bestD = Infinity
    for (const s of snaps) {
      const d = Math.abs(snapY(s, h) - current)
      if (d < bestD) {
        bestD = d
        best = s
      }
    }
    setSheet(best)
  }

  return (
    <motion.section
      aria-label="Inspector"
      className="panel-glass absolute inset-x-0 top-0 z-30 flex flex-col rounded-t-2xl border-t border-line shadow-panel"
      style={{ y, height: h - snapY(sheet, h), touchAction: 'none' }}
      drag="y"
      dragConstraints={{ top: snapY('full', h), bottom: snapY('peek', h) }}
      dragElastic={0.05}
      dragMomentum={false}
      onDragEnd={onDragEnd}
    >
      <button
        type="button"
        className="flex w-full shrink-0 items-center justify-center py-3"
        aria-label={sheet === 'peek' ? 'Open inspector' : 'Collapse inspector'}
        onClick={() => setSheet(sheet === 'peek' ? 'half' : sheet === 'half' ? 'full' : 'peek')}
      >
        <span className="h-1.5 w-10 rounded-full bg-line-2" aria-hidden />
      </button>
      <div className="min-h-0 flex-1">
        <InspectorBody />
      </div>
    </motion.section>
  )
}
