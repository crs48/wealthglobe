import { useEffect, useMemo, useState, type KeyboardEvent, type RefObject } from 'react'
import { useStore } from '../store'
import { resolveSubject, type ResolvedSubject, type SubjectRef } from './subjects'
import { GOLD } from './colors'

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() => (typeof window !== 'undefined' ? window.matchMedia(query).matches : false))
  useEffect(() => {
    const mq = window.matchMedia(query)
    const onChange = () => setMatches(mq.matches)
    onChange()
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [query])
  return matches
}

export function useElementSize(ref: RefObject<HTMLElement | null>): { width: number; height: number } {
  const [size, setSize] = useState({ width: 0, height: 0 })
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const ro = new ResizeObserver((entries) => {
      const r = entries[0].contentRect
      setSize((prev) => (prev.width === r.width && prev.height === r.height ? prev : { width: r.width, height: r.height }))
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [ref])
  return size
}

/** Resolve a subject reference against the loaded country framings. */
export function useResolved(ref: SubjectRef | null, color = GOLD): ResolvedSubject | null {
  const framings = useStore((s) => s.framings)
  return useMemo(() => (ref ? resolveSubject(ref, framings, color) : null), [ref, framings, color])
}

/** Arrow-key navigation across `[data-row]` buttons inside a container. */
export function listKeyHandler(e: KeyboardEvent<HTMLElement>) {
  const keys = ['ArrowDown', 'ArrowUp', 'Home', 'End']
  if (!keys.includes(e.key)) return
  const rows = Array.from(e.currentTarget.querySelectorAll<HTMLElement>('[data-row]'))
  if (rows.length === 0) return
  const i = rows.indexOf(document.activeElement as HTMLElement)
  let next = i
  if (e.key === 'ArrowDown') next = Math.min(rows.length - 1, i + 1)
  if (e.key === 'ArrowUp') next = Math.max(0, i - 1)
  if (e.key === 'Home') next = 0
  if (e.key === 'End') next = rows.length - 1
  if (next !== i || i === -1) {
    e.preventDefault()
    rows[next === -1 ? 0 : next].focus()
  }
}
