import { useEffect, useMemo, useRef, useState } from 'react'
import { Search as SearchIcon, X } from 'lucide-react'
import { COUNTRIES } from '../data/countries'
import { PEOPLE } from '../data/people'
import { PERSONAS, PERSONA_PAIRS } from '../data/personas'
import { PLACES } from '../data/places'
import { REGION_LABEL } from '../data/regions'
import { formatUsd } from '../lib/allocation'
import { statForMode, useStore } from '../store'

type Hit =
  | { kind: 'country'; id: string; label: string; detail: string }
  | { kind: 'place'; id: string; label: string; detail: string }
  | { kind: 'person'; id: string; label: string; detail: string }
  | { kind: 'persona'; id: string; label: string; detail: string }
  | { kind: 'pair'; id: string; label: string; detail: string }

const KIND_LABEL: Record<Hit['kind'], string> = {
  country: 'Country',
  place: 'Place',
  person: 'Person',
  persona: 'Life',
  pair: 'Pair',
}

function buildIndex(): Hit[] {
  const hits: Hit[] = []
  for (const c of COUNTRIES) hits.push({ kind: 'country', id: c.iso3, label: c.name, detail: REGION_LABEL[c.region] })
  for (const p of PLACES) {
    const c = COUNTRIES.find((x) => x.iso3 === p.iso3)
    hits.push({ kind: 'place', id: p.id, label: p.label, detail: c ? c.name : p.iso3 })
  }
  for (const p of PEOPLE) hits.push({ kind: 'person', id: p.id, label: p.name, detail: `${formatUsd(p.wealthUsd, { compact: true })} · ${p.role}` })
  for (const p of PERSONAS) hits.push({ kind: 'persona', id: p.id, label: p.label, detail: p.sublabel })
  for (const p of PERSONA_PAIRS) hits.push({ kind: 'pair', id: p.id, label: p.label, detail: p.sublabel })
  return hits
}

const INDEX = buildIndex()

function score(hit: Hit, q: string): number {
  const label = hit.label.toLowerCase()
  const detail = hit.detail.toLowerCase()
  if (label === q) return 0
  if (label.startsWith(q)) return 1
  if (label.split(/[\s,]+/).some((w) => w.startsWith(q))) return 2
  if (label.includes(q)) return 3
  if (detail.includes(q)) return 4
  return -1
}

export function Search({ compact = false, autoFocus = false }: { compact?: boolean; autoFocus?: boolean }) {
  const query = useStore((s) => s.query)
  const setQuery = useStore((s) => s.setQuery)
  const mode = useStore((s) => s.mode)
  const select = useStore((s) => s.select)
  const selectPair = useStore((s) => s.selectPair)
  const flyTo = useStore((s) => s.flyTo)
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const listId = 'search-results'

  const hits = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (q.length < 1) return []
    return INDEX.map((h) => ({ h, s: score(h, q) }))
      .filter((x) => x.s >= 0)
      .sort((a, b) => a.s - b.s || a.h.label.localeCompare(b.h.label))
      .slice(0, 8)
      .map((x) => x.h)
  }, [query])

  // "/" focuses the search box from anywhere that is not a text field.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== '/' || e.metaKey || e.ctrlKey || e.altKey) return
      const t = e.target as HTMLElement | null
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return
      e.preventDefault()
      inputRef.current?.focus()
      inputRef.current?.select()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  useEffect(() => {
    if (autoFocus) inputRef.current?.focus()
  }, [autoFocus])

  function choose(hit: Hit) {
    const stat = statForMode(mode)
    switch (hit.kind) {
      case 'country':
        select({ kind: 'country', iso3: hit.id, stat })
        break
      case 'place': {
        const place = PLACES.find((p) => p.id === hit.id)!
        if (place.persona) {
          const isPair = PERSONA_PAIRS.some((p) => p.id === place.persona)
          if (isPair) selectPair(place.persona)
          else select({ kind: 'persona', id: place.persona })
        } else {
          select({ kind: 'country', iso3: place.iso3, stat }, { fly: false })
          flyTo(place.lat, place.lng, 0.3)
        }
        break
      }
      case 'person':
        select({ kind: 'person', id: hit.id })
        break
      case 'persona':
        select({ kind: 'persona', id: hit.id })
        break
      case 'pair':
        selectPair(hit.id)
        break
    }
    setQuery('')
    setOpen(false)
    inputRef.current?.blur()
  }

  return (
    <div className={`relative ${compact ? 'w-full' : 'w-full max-w-sm'}`}>
      <div className="relative">
        <SearchIcon className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-fog" aria-hidden />
        <input
          ref={inputRef}
          type="search"
          role="combobox"
          aria-label="Search countries, cities, people and lives"
          aria-expanded={open && hits.length > 0}
          aria-controls={listId}
          aria-activedescendant={open && hits[active] ? `${listId}-${active}` : undefined}
          aria-autocomplete="list"
          autoComplete="off"
          placeholder="Search a country, city, person…  ( / )"
          className="field pl-9 pr-8"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setActive(0)
            setOpen(true)
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 120)}
          onKeyDown={(e) => {
            if (e.key === 'ArrowDown') {
              e.preventDefault()
              setActive((a) => Math.min(hits.length - 1, a + 1))
            } else if (e.key === 'ArrowUp') {
              e.preventDefault()
              setActive((a) => Math.max(0, a - 1))
            } else if (e.key === 'Enter') {
              if (hits[active]) choose(hits[active])
            } else if (e.key === 'Escape') {
              if (query) setQuery('')
              else inputRef.current?.blur()
              setOpen(false)
            }
          }}
        />
        {query && (
          <button
            type="button"
            aria-label="Clear search"
            className="absolute top-1/2 right-2 -translate-y-1/2 rounded p-1 text-fog hover:text-snow"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => setQuery('')}
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
      {open && hits.length > 0 && (
        <ul
          id={listId}
          role="listbox"
          className="panel-glass absolute z-30 mt-1 w-full overflow-hidden rounded-lg border border-line shadow-panel"
        >
          {hits.map((h, i) => (
            <li
              key={`${h.kind}:${h.id}`}
              id={`${listId}-${i}`}
              role="option"
              aria-selected={i === active}
              className={`flex cursor-pointer items-center justify-between gap-3 px-3 py-2 text-sm ${i === active ? 'bg-panel-3' : ''}`}
              onMouseDown={(e) => e.preventDefault()}
              onMouseEnter={() => setActive(i)}
              onClick={() => choose(h)}
            >
              <span className="min-w-0">
                <span className="block truncate text-snow">{h.label}</span>
                <span className="block truncate text-xs text-fog">{h.detail}</span>
              </span>
              <span className="chip shrink-0 border-line-2 text-fog">{KIND_LABEL[h.kind]}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
