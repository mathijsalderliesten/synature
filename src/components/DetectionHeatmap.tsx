import { useMemo } from 'react'
import { sites } from '../data/sites'
import { useHeatmapState } from '../hooks/useHeatmapState'
import { buildColumns } from '../lib/aggregate'
import { buildClassSections, buildRowEntry } from '../lib/rowList'
import { nodeById, rootTaxa } from '../lib/taxonomyTree'
import { HeatmapGrid } from './HeatmapGrid'
import { HeatmapHeader } from './HeatmapHeader'
import { HeatmapLegend } from './HeatmapLegend'
import { RowToolbar } from './RowToolbar'

export function DetectionHeatmap() {
  const state = useHeatmapState()
  const {
    filters,
    selectedSiteIds,
    groupByHabitat,
    pinned,
    colorMode,
    showCounts,
    hideRareEnabled,
    hideRareThreshold,
    topN,
    expandedClassIds,
    otherExpandedByClass,
    highlightedTaxonId,
  } = state

  const columns = useMemo(
    () => buildColumns(sites, selectedSiteIds, groupByHabitat),
    [selectedSiteIds, groupByHabitat],
  )

  const pinnedRows = useMemo(
    () =>
      [...pinned]
        .map((id) => nodeById.get(id))
        .filter((n): n is NonNullable<typeof n> => n !== undefined)
        .map((n) => buildRowEntry(n, columns, filters)),
    [pinned, columns, filters],
  )

  const sections = useMemo(
    () =>
      buildClassSections(rootTaxa, columns, filters, pinned, {
        topN,
        hideRareThreshold: hideRareEnabled ? hideRareThreshold : null,
        otherExpandedClassIds: otherExpandedByClass,
      }),
    [columns, filters, pinned, topN, hideRareEnabled, hideRareThreshold, otherExpandedByClass],
  )

  const hiddenRareCount = useMemo(
    () => sections.reduce((sum, s) => sum + s.hiddenRareCount, 0),
    [sections],
  )

  return (
    <div className="mx-auto max-w-7xl rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
      <HeatmapHeader
        start={filters.start}
        end={filters.end}
        onDateChange={state.setDateRange}
        statuses={filters.statuses}
        onToggleStatus={state.toggleStatus}
        selectedSiteIds={selectedSiteIds}
        onToggleSite={state.toggleSite}
        onSetAllSites={state.setAllSites}
        groupByHabitat={groupByHabitat}
        onToggleGroupByHabitat={() => state.setGroupByHabitat((g) => !g)}
        filtersOpen={state.filtersOpen}
        onToggleFiltersOpen={() => state.setFiltersOpen((v) => !v)}
      />

      <div className="mt-5 flex flex-wrap items-end justify-between gap-6 border-t border-neutral-100 pt-5">
        <HeatmapLegend
          mode={colorMode}
          onModeChange={state.setColorMode}
          globalMax={Math.max(
            1,
            ...pinnedRows.flatMap((r) => [...r.counts.values()]),
            ...sections.flatMap((s) => [
              ...s.classRow.counts.values(),
              ...s.speciesRows.flatMap((r) => [...r.counts.values()]),
              ...(s.otherRow ? [...s.otherRow.counts.values()] : []),
            ]),
          )}
        />
        <RowToolbar
          showCounts={showCounts}
          onToggleShowCounts={() => state.setShowCounts((v) => !v)}
          hideRareEnabled={hideRareEnabled}
          onToggleHideRare={() => state.setHideRareEnabled((v) => !v)}
          hideRareThreshold={hideRareThreshold}
          hiddenRareCount={hiddenRareCount}
          onJump={state.jumpToSpecies}
        />
      </div>

      <div className="mt-4 pb-8">
        <HeatmapGrid
          pinnedRows={pinnedRows}
          pinned={pinned}
          sections={sections}
          columns={columns}
          colorMode={colorMode}
          showCounts={showCounts}
          onTogglePin={state.togglePin}
          expandedClassIds={expandedClassIds}
          onToggleClassExpanded={state.toggleClassExpanded}
          onToggleOtherForClass={state.toggleOtherExpandedForClass}
          highlightedTaxonId={highlightedTaxonId}
          topN={topN}
        />
      </div>
    </div>
  )
}
