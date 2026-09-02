import { useEffect, useRef } from 'react'
import type { Column } from '../lib/aggregate'
import { readableTextColor, valueColor, valueColorLog } from '../lib/color'
import { formatCount } from '../lib/format'
import type { ClassSection, RowEntry } from '../lib/rowList'
import { nodeById } from '../lib/taxonomyTree'
import type { ColorMode } from '../hooks/useHeatmapState'
import { PinIcon } from './RowIcons'

const LABEL_W = 220
const CELL_W = 64

function Cell({
  row,
  column,
  colorMode,
  rowMax,
  globalMax,
  showCounts,
}: {
  row: RowEntry
  column: Column
  colorMode: ColorMode
  rowMax: number
  globalMax: number
  showCounts: boolean
}) {
  const value = row.counts.get(column.id) ?? 0
  const color = colorMode === 'absolute' ? valueColorLog(value, globalMax) : valueColor(value, rowMax)
  const textColor = readableTextColor(color)
  const share = row.total > 0 ? (value / row.total) * 100 : 0

  return (
    <div className="group relative flex items-center justify-center p-1">
      <div
        className="flex h-8 w-full max-w-[52px] items-center justify-center rounded-md transition-colors"
        style={{ backgroundColor: color }}
      >
        {showCounts && value > 0 && (
          <span className="text-[8px] font-semibold leading-none" style={{ color: textColor }}>
            {formatCount(value)}
          </span>
        )}
      </div>
      <div className="pointer-events-none absolute left-1/2 top-full z-30 mt-1 w-max max-w-[220px] -translate-x-1/2 rounded-md bg-neutral-900 px-2.5 py-1.5 text-[11px] text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
        <div className="font-medium">{row.commonName ?? row.name}</div>
        <div className="text-neutral-300">{column.label}</div>
        <div className="mt-0.5 text-neutral-200">
          {formatCount(value)} detections &middot; {share.toFixed(1)}% of row
        </div>
      </div>
    </div>
  )
}

function ClassRow({
  row,
  columns,
  colorMode,
  globalMax,
  showCounts,
  expanded,
  onToggleExpand,
}: {
  row: RowEntry
  columns: Column[]
  colorMode: ColorMode
  globalMax: number
  showCounts: boolean
  expanded: boolean
  onToggleExpand: () => void
}) {
  return (
    <RowShellWrapper row={row} columns={columns} colorMode={colorMode} globalMax={globalMax} showCounts={showCounts}>
      <button type="button" onClick={onToggleExpand} className="flex min-w-0 items-center gap-1.5 text-left">
        <svg
          width="10"
          height="10"
          viewBox="0 0 10 10"
          className={`shrink-0 text-neutral-400 transition-transform ${expanded ? 'rotate-90' : ''}`}
          fill="none"
        >
          <path d="M3 1.5 7 5l-4 3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span className="truncate text-sm font-semibold text-neutral-900">{row.name}</span>
      </button>
    </RowShellWrapper>
  )
}

export interface HeatmapGridProps {
  pinnedRows: RowEntry[]
  pinned: Set<string>
  sections: ClassSection[]
  columns: Column[]
  colorMode: ColorMode
  showCounts: boolean
  onTogglePin: (id: string) => void
  expandedClassIds: Set<string>
  onToggleClassExpanded: (id: string) => void
  onToggleOtherForClass: (id: string) => void
  highlightedTaxonId: string | null
  topN: number
}

export function HeatmapGrid({
  pinnedRows,
  pinned,
  sections,
  columns,
  colorMode,
  showCounts,
  onTogglePin,
  expandedClassIds,
  onToggleClassExpanded,
  onToggleOtherForClass,
  highlightedTaxonId,
  topN,
}: HeatmapGridProps) {
  const allRows = [
    ...pinnedRows,
    ...sections.flatMap((s) => [s.classRow, ...s.speciesRows, ...(s.otherRow ? [s.otherRow] : [])]),
  ]
  const globalMax = Math.max(1, ...allRows.flatMap((r) => [...r.counts.values()]))

  if (columns.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-neutral-200 px-4 py-10 text-center text-sm text-neutral-400">
        No sites selected. Choose at least one site to show the heatmap.
      </p>
    )
  }

  return (
    <div>
      {pinnedRows.length > 0 && (
        <div className="px-2 pb-1 text-[10px] font-medium uppercase tracking-wide text-neutral-400">Pinned</div>
      )}
      <div className="max-h-[560px] overflow-auto rounded-lg border border-neutral-100">
        {pinnedRows.map((row) => {
          const classId = nodeById.get(row.taxonId)?.parentId
          const className = classId ? nodeById.get(classId)?.name : undefined
          return (
            <RowShellWrapper
              key={`pin-${row.id}`}
              row={row}
              columns={columns}
              colorMode={colorMode}
              globalMax={globalMax}
              showCounts={showCounts}
              tinted
              highlighted={highlightedTaxonId === row.taxonId}
            >
              <button
                type="button"
                title={pinned.has(row.taxonId) ? 'Unpin' : 'Pin'}
                onClick={() => onTogglePin(row.taxonId)}
                className="shrink-0 rounded p-0.5 text-neutral-300 hover:bg-neutral-100 hover:text-violet-600"
              >
                <PinIcon active={pinned.has(row.taxonId)} />
              </button>
              <span className="min-w-0 truncate text-sm font-medium text-neutral-800" title={row.name}>
                {row.commonName ?? row.name}
              </span>
              {className && (
                <span className="shrink-0 rounded-full bg-neutral-100 px-1.5 py-0.5 text-[10px] font-medium text-neutral-500">
                  {className}
                </span>
              )}
            </RowShellWrapper>
          )
        })}

        {sections.map((section) => {
          const expanded = expandedClassIds.has(section.classRow.taxonId)
          return (
            <div key={section.classRow.id}>
              <ClassRow
                row={section.classRow}
                columns={columns}
                colorMode={colorMode}
                globalMax={globalMax}
                showCounts={showCounts}
                expanded={expanded}
                onToggleExpand={() => onToggleClassExpanded(section.classRow.taxonId)}
              />
              {expanded && (
                <>
                  {section.speciesRows.length === 0 && !section.otherRow && (
                    <p className="px-4 py-3 pl-8 text-xs text-neutral-400">No species match the current filters.</p>
                  )}
                  {section.speciesRows.map((row) => (
                    <RowShellWrapper
                      key={row.id}
                      row={row}
                      columns={columns}
                      colorMode={colorMode}
                      globalMax={globalMax}
                      showCounts={showCounts}
                      highlighted={highlightedTaxonId === row.taxonId}
                      indent
                    >
                      <button
                        type="button"
                        title={pinned.has(row.taxonId) ? 'Unpin' : 'Pin row (keeps it visible at the top)'}
                        onClick={() => onTogglePin(row.taxonId)}
                        className="shrink-0 rounded p-0.5 text-neutral-300 hover:bg-neutral-100 hover:text-violet-600"
                      >
                        <PinIcon active={pinned.has(row.taxonId)} />
                      </button>
                      <span className="min-w-0 truncate text-sm text-neutral-700" title={row.name}>
                        {row.commonName ?? row.name}
                      </span>
                      <span className="shrink-0 rounded-full bg-neutral-100 px-1.5 py-0.5 text-[10px] font-medium text-neutral-500">
                        {section.classRow.name}
                      </span>
                    </RowShellWrapper>
                  ))}
                  {section.otherRow && (
                    <RowShellWrapper
                      row={section.otherRow}
                      columns={columns}
                      colorMode={colorMode}
                      globalMax={globalMax}
                      showCounts={showCounts}
                      indent
                    >
                      <button
                        type="button"
                        onClick={() => onToggleOtherForClass(section.classRow.taxonId)}
                        className="min-w-0 truncate text-left text-sm text-neutral-600 hover:text-violet-700 hover:underline"
                      >
                        {section.otherRow.name}
                      </button>
                    </RowShellWrapper>
                  )}
                  {section.otherRow === null && section.speciesRows.length > topN && (
                    <button
                      type="button"
                      onClick={() => onToggleOtherForClass(section.classRow.taxonId)}
                      className="w-full border-t border-neutral-100 px-3 py-1.5 pl-8 text-left text-[11px] text-violet-600 hover:bg-violet-50"
                    >
                      Collapse back into &ldquo;Other&rdquo;
                    </button>
                  )}
                </>
              )}
            </div>
          )
        })}

        <FooterLabels columns={columns} />
      </div>
    </div>
  )
}

function RowShellWrapper({
  row,
  columns,
  colorMode,
  globalMax,
  showCounts,
  highlighted,
  tinted,
  indent,
  children,
}: {
  row: RowEntry
  columns: Column[]
  colorMode: ColorMode
  globalMax: number
  showCounts: boolean
  highlighted?: boolean
  tinted?: boolean
  indent?: boolean
  children: React.ReactNode
}) {
  const rowMax = Math.max(0, ...row.counts.values())
  const bg = highlighted ? 'bg-violet-50' : tinted ? 'bg-violet-50/30 hover:bg-violet-50/50' : 'hover:bg-neutral-50'
  const labelBg = highlighted ? 'bg-violet-50' : tinted ? 'bg-[#fbf9ff]' : 'bg-white'

  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!highlighted) return
    // Center the row within its scroll container via a direct scrollTop write
    // (not the scrollIntoView API, which triggered a headless-Chromium paint bug).
    const el = ref.current
    const container = el?.closest<HTMLElement>('.overflow-auto')
    if (!el || !container) return
    const elRect = el.getBoundingClientRect()
    const containerRect = container.getBoundingClientRect()
    if (elRect.top < containerRect.top || elRect.bottom > containerRect.bottom) {
      container.scrollTop += elRect.top - containerRect.top - containerRect.height / 2 + elRect.height / 2
    }
  }, [highlighted])

  return (
    <div
      ref={ref}
      className={`grid border-b border-neutral-100 transition-colors last:border-b-0 ${bg}`}
      style={{ gridTemplateColumns: `${LABEL_W}px repeat(${columns.length}, ${CELL_W}px)` }}
    >
      <div className={`sticky left-0 z-10 flex min-w-0 items-center gap-1 px-2 py-1.5 ${indent ? 'pl-6' : ''} ${labelBg}`}>
        {children}
      </div>
      {columns.map((col) => (
        <Cell key={col.id} row={row} column={col} colorMode={colorMode} rowMax={rowMax} globalMax={globalMax} showCounts={showCounts} />
      ))}
    </div>
  )
}

function FooterLabels({ columns }: { columns: Column[] }) {
  return (
    <div
      className="sticky bottom-0 z-20 grid border-t border-neutral-100 bg-white"
      style={{ gridTemplateColumns: `${LABEL_W}px repeat(${columns.length}, ${CELL_W}px)` }}
    >
      <div className="sticky left-0 z-10 bg-white" />
      {columns.map((col) => (
        <div key={col.id} className="flex items-start justify-center pt-2">
          <span
            className="origin-top-left whitespace-nowrap text-[11px] text-neutral-500"
            style={{ transform: 'rotate(-40deg) translate(4px, 4px)' }}
          >
            {col.label}
          </span>
        </div>
      ))}
    </div>
  )
}
