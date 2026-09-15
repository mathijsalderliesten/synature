import { useEffect, useRef } from 'react'
import type { ColorMode } from '../hooks/useHeatmapState'
import type { Column } from '../lib/aggregate'
import { readableTextColor, valueColor, valueColorLog } from '../lib/color'
import { formatCount } from '../lib/format'
import type { RowEntry } from '../lib/rowList'
import { PinIcon } from './RowIcons'

const LABEL_W = 212
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

interface RowProps {
  row: RowEntry
  columns: Column[]
  colorMode: ColorMode
  globalMax: number
  showCounts: boolean
  pinned: boolean
  onTogglePin: (id: string) => void
  onDrillInto: (id: string) => void
  onToggleOther: () => void
  highlighted: boolean
}

function Row({
  row,
  columns,
  colorMode,
  globalMax,
  showCounts,
  pinned,
  onTogglePin,
  onDrillInto,
  onToggleOther,
  highlighted,
}: RowProps) {
  const rowMax = Math.max(0, ...row.counts.values())
  const drillable = !row.isOther && row.rank !== undefined && row.rank !== 'Species'
  const clickable = drillable || row.isOther

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
      className={`grid border-b border-neutral-100 transition-colors last:border-b-0 ${
        highlighted ? 'bg-violet-50' : pinned ? 'bg-violet-50/30 hover:bg-violet-50/50' : 'hover:bg-neutral-50'
      }`}
      style={{ gridTemplateColumns: `${LABEL_W}px repeat(${columns.length}, ${CELL_W}px)` }}
    >
      <div
        className={`sticky left-0 z-10 flex min-w-0 items-center gap-1 px-2 py-1.5 ${
          highlighted ? 'bg-violet-50' : pinned ? 'bg-[#fbf9ff]' : 'bg-white'
        }`}
      >
        {!row.isOther && (
          <button
            type="button"
            title={pinned ? 'Unpin row' : 'Pin row (stays visible while you drill elsewhere)'}
            onClick={() => onTogglePin(row.taxonId)}
            className="shrink-0 rounded p-0.5 text-neutral-300 hover:bg-neutral-100 hover:text-violet-600"
          >
            <PinIcon active={pinned} />
          </button>
        )}
        <button
          type="button"
          onClick={() => (row.isOther ? onToggleOther() : drillable && onDrillInto(row.taxonId))}
          title={row.commonName ? `${row.commonName} (${row.name})` : row.name}
          className={`min-w-0 truncate text-left text-sm font-medium text-neutral-800 ${
            clickable ? 'cursor-pointer hover:text-violet-700 hover:underline' : 'cursor-default'
          }`}
        >
          {row.commonName ?? row.name}
        </button>
        {drillable && <span className="shrink-0 text-[10px] text-neutral-300">›</span>}
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

export interface HeatmapGridProps {
  pinnedRows: RowEntry[]
  pinned: Set<string>
  mainRows: RowEntry[]
  otherRow: RowEntry | null
  columns: Column[]
  colorMode: ColorMode
  showCounts: boolean
  onTogglePin: (id: string) => void
  onDrillInto: (id: string) => void
  otherExpanded: boolean
  onToggleOtherExpanded: () => void
  highlightedTaxonId: string | null
}

export function HeatmapGrid({
  pinnedRows,
  pinned,
  mainRows,
  otherRow,
  columns,
  colorMode,
  showCounts,
  onTogglePin,
  onDrillInto,
  otherExpanded,
  onToggleOtherExpanded,
  highlightedTaxonId,
}: HeatmapGridProps) {
  const allRows = [...pinnedRows, ...mainRows, ...(otherRow ? [otherRow] : [])]
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
        {pinnedRows.map((row) => (
          <Row
            key={`pin-${row.id}`}
            row={row}
            columns={columns}
            colorMode={colorMode}
            globalMax={globalMax}
            showCounts={showCounts}
            pinned={pinned.has(row.taxonId)}
            onTogglePin={onTogglePin}
            onDrillInto={onDrillInto}
            onToggleOther={onToggleOtherExpanded}
            highlighted={highlightedTaxonId === row.taxonId}
          />
        ))}
        {mainRows.map((row) => (
          <Row
            key={row.id}
            row={row}
            columns={columns}
            colorMode={colorMode}
            globalMax={globalMax}
            showCounts={showCounts}
            pinned={pinned.has(row.taxonId)}
            onTogglePin={onTogglePin}
            onDrillInto={onDrillInto}
            onToggleOther={onToggleOtherExpanded}
            highlighted={highlightedTaxonId === row.taxonId}
          />
        ))}
        {otherRow && (
          <Row
            row={otherRow}
            columns={columns}
            colorMode={colorMode}
            globalMax={globalMax}
            showCounts={showCounts}
            pinned={false}
            onTogglePin={onTogglePin}
            onDrillInto={onDrillInto}
            onToggleOther={onToggleOtherExpanded}
            highlighted={false}
          />
        )}
        {otherExpanded && (
          <button
            type="button"
            onClick={onToggleOtherExpanded}
            className="w-full border-t border-neutral-100 px-3 py-1.5 text-left text-[11px] text-violet-600 hover:bg-violet-50"
          >
            Collapse back into &ldquo;Other&rdquo;
          </button>
        )}
        {mainRows.length === 0 && !otherRow && pinnedRows.length === 0 && (
          <p className="px-4 py-10 text-center text-sm text-neutral-400">No taxa match the current filters.</p>
        )}
        <FooterLabels columns={columns} />
      </div>
    </div>
  )
}
