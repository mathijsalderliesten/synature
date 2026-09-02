import { useRef, useState } from 'react'
import { searchSpecies } from '../lib/search'

export function SearchJump({ onJump }: { onJump: (speciesId: string) => void }) {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const matches = searchSpecies(query)

  function handleBlur(e: React.FocusEvent<HTMLDivElement>) {
    if (!containerRef.current?.contains(e.relatedTarget as Node)) setOpen(false)
  }

  return (
    <div className="relative" ref={containerRef} onBlur={handleBlur}>
      <div className="flex items-center gap-1.5 rounded-lg border border-neutral-200 bg-white px-2.5 py-1.5 shadow-sm focus-within:border-violet-300 focus-within:ring-2 focus-within:ring-violet-100">
        <svg width="12" height="12" viewBox="0 0 16 16" fill="none" className="shrink-0 text-neutral-400">
          <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.4" />
          <path d="M11 11 14.5 14.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        </svg>
        <input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setOpen(true)
          }}
          onFocus={() => setOpen(true)}
          placeholder="Find a species…"
          className="w-36 text-xs text-neutral-700 outline-none placeholder:text-neutral-400"
        />
      </div>
      {open && matches.length > 0 && (
        <div className="absolute z-20 mt-1.5 w-64 rounded-lg border border-neutral-200 bg-white p-1.5 shadow-lg">
          {matches.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => {
                onJump(m.id)
                setQuery('')
                setOpen(false)
              }}
              className="flex w-full flex-col items-start rounded-md px-2 py-1.5 text-left hover:bg-violet-50"
            >
              <span className="text-xs font-medium text-neutral-800">
                {m.commonName ?? m.name}
                {m.commonName && <span className="ml-1 italic text-neutral-400">{m.name}</span>}
              </span>
              <span className="text-[10px] text-neutral-400">{m.path}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
