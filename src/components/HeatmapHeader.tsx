import { sites } from '../data/sites'
import type { DetectionStatus } from '../data/types'
import { DateRangeControl } from './controls/DateRangeControl'
import { SitesControl } from './controls/SitesControl'
import { StatusControl } from './controls/StatusControl'

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
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 className="text-lg font-semibold text-neutral-900">Detection heatmap</h1>
        <p className="mt-0.5 text-xs text-neutral-400">Acoustic detections by taxon &amp; site</p>
      </div>
      <div className="flex flex-wrap items-center gap-2">
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
    </div>
  )
}
