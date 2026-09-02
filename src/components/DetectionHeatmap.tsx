import { sites } from '../data/sites'
import { defaultFilters } from '../lib/aggregate'
import { rootTaxa } from '../lib/taxonomyTree'
import { HeatmapGrid } from './HeatmapGrid'
import { HeatmapHeader } from './HeatmapHeader'
import { HeatmapLegend } from './HeatmapLegend'

export function DetectionHeatmap() {
  const filters = defaultFilters(sites.map((s) => s.id))

  return (
    <div className="mx-auto max-w-5xl rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
      <HeatmapHeader
        start={filters.start}
        end={filters.end}
        siteCount={filters.siteIds.length}
        totalSites={sites.length}
      />

      <div className="mt-5 border-t border-neutral-100 pt-5">
        <HeatmapLegend />
      </div>

      <div className="mt-4 pb-10">
        <HeatmapGrid rows={rootTaxa} sites={sites} filters={filters} />
      </div>
    </div>
  )
}
