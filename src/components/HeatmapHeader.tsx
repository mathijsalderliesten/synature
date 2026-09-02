import { sites } from '../data/sites'
import { detectionWindow } from '../data/detections'
import type { DetectionStatus } from '../data/types'
import { DateRangeControl } from './controls/DateRangeControl'
import { SitesControl } from './controls/SitesControl'
import { StatusControl } from './controls/StatusControl'

function FilterIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
      <path
        d="M2 3h12M4.5 8h7M7 13h2"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  )
}

export function HeatmapHeader({
  start,
  end,
  onDateChange,
  statuses,
  onToggleStatus,
  selectedSiteIds,
  onToggleSite,
  onSetAllSites,
  groupByHabitat,
  onToggleGroupByHabitat,
  filtersOpen,
  onToggleFiltersOpen,
}: {
  start: number
  end: number
  onDateChange: (start: number, end: number) => void
  statuses: Set<DetectionStatus>
  onToggleStatus: (status: DetectionStatus) => void
  selectedSiteIds: Set<string>
  onToggleSite: (id: string) => void
  onSetAllSites: (on: boolean) => void
  groupByHabitat: boolean
  onToggleGroupByHabitat: () => void
  filtersOpen: boolean
  onToggleFiltersOpen: () => void
}) {
  const isDefaultRange = Math.abs(start - detectionWindow.start) < 60_000 && Math.abs(end - detectionWindow.end) < 60_000
  const hasActiveFilters =
    !isDefaultRange || statuses.size < 2 || selectedSiteIds.size < sites.length || groupByHabitat

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-lg font-semibold text-neutral-900">Detection heatmap</h1>
          <p className="mt-0.5 text-xs text-neutral-400">Acoustic detections by taxon &amp; site</p>
        </div>
        <button
          type="button"
          onClick={onToggleFiltersOpen}
          className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium shadow-sm transition-colors ${
            filtersOpen
              ? 'border-violet-300 bg-violet-50 text-violet-700'
              : 'border-neutral-200 bg-white text-neutral-600 hover:border-neutral-300 hover:bg-neutral-50'
          }`}
        >
          <FilterIcon />
          Filters
          {hasActiveFilters && <span className="h-1.5 w-1.5 rounded-full bg-violet-500" />}
          <svg width="10" height="10" viewBox="0 0 10 10" className={`ml-0.5 transition-transform ${filtersOpen ? 'rotate-180' : ''}`} fill="none">
            <path d="M2 3.5 5 6.5 8 3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      {filtersOpen && (
        <div className="mt-3 flex flex-wrap items-center gap-2 rounded-lg border border-neutral-100 bg-neutral-50/60 p-2.5">
          <DateRangeControl start={start} end={end} onChange={onDateChange} />
          <StatusControl statuses={statuses} onToggle={onToggleStatus} />
          <SitesControl
            sites={sites}
            selectedSiteIds={selectedSiteIds}
            onToggleSite={onToggleSite}
            onSetAll={onSetAllSites}
            groupByHabitat={groupByHabitat}
            onToggleGroupByHabitat={onToggleGroupByHabitat}
          />
        </div>
      )}
    </div>
  )
}
