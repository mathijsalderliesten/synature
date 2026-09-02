import type { Site, TaxonNode } from '../data/types'
import type { Filters } from '../lib/aggregate'
import { rowCounts } from '../lib/aggregate'
import { valueColor } from '../lib/color'
import { formatCount } from '../lib/format'

interface HeatmapGridProps {
  rows: TaxonNode[]
  sites: Site[]
  filters: Filters
}

export function HeatmapGrid({ rows, sites, filters }: HeatmapGridProps) {
  const gridTemplateColumns = `200px repeat(${sites.length}, minmax(56px, 1fr))`

  return (
    <div className="overflow-x-auto">
      <div className="min-w-fit" style={{ display: 'grid', gridTemplateColumns }}>
        {rows.map((row) => {
          const counts = rowCounts(row.id, filters)
          const rowMax = Math.max(0, ...counts.values())
          return (
            <div key={row.id} className="contents">
              <div className="flex items-center border-b border-neutral-100 px-2 py-1.5 text-sm text-neutral-700">
                <span className="truncate font-medium">{row.name}</span>
              </div>
              {sites.map((site) => {
                const value = counts.get(site.id) ?? 0
                const color = valueColor(value, rowMax)
                return (
                  <div
                    key={site.id}
                    className="flex items-center justify-center border-b border-neutral-100 p-1"
                    title={`${row.name} @ ${site.name}: ${formatCount(value)} detections`}
                  >
                    <div
                      className="h-8 w-full max-w-9 rounded-md transition-colors"
                      style={{ backgroundColor: color }}
                    />
                  </div>
                )
              })}
            </div>
          )
        })}

        {/* Column headers along the bottom, rotated. */}
        <div />
        {sites.map((site) => (
          <div key={site.id} className="flex items-start justify-center pt-2">
            <span
              className="origin-top-left translate-x-3 translate-y-1 whitespace-nowrap text-[11px] text-neutral-500"
              style={{ transform: 'rotate(-40deg) translate(4px, 4px)' }}
            >
              {site.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
