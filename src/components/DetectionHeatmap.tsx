import { useMemo } from 'react'
import { sites } from '../data/sites'
import { useHeatmapState } from '../hooks/useHeatmapState'
import { computeActivity } from '../lib/activity'
import { buildColumns } from '../lib/aggregate'
import { buildRowEntry, buildRowList } from '../lib/rowList'
import { getChildren, nodeById } from '../lib/taxonomyTree'
import { ActivityPanel } from './ActivityPanel'
import { Breadcrumb } from './Breadcrumb'
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
    currentParentId,
    breadcrumb,
    pinned,
    colorMode,
    showCounts,
    hideRareEnabled,
    hideRareThreshold,
    topN,
    otherExpanded,
    highlightedTaxonId,
  } = state

  const columns = useMemo(
    () => buildColumns(sites, selectedSiteIds, groupByHabitat),
    [selectedSiteIds, groupByHabitat],
  )

  const currentLevelNodes = useMemo(() => getChildren(currentParentId), [currentParentId])

  const pinnedNodes = useMemo(
    () => [...pinned.keys()].map((id) => nodeById.get(id)).filter((n): n is NonNullable<typeof n> => n !== undefined),
    [pinned],
  )

  const pinnedRows = useMemo(
    () => pinnedNodes.map((n) => buildRowEntry(n, columns, filters)),
    [pinnedNodes, columns, filters],
  )

  const mainNodes = useMemo(
    () => currentLevelNodes.filter((n) => !pinned.has(n.id)),
    [currentLevelNodes, pinned],
  )

  const { rows: mainRows, otherRow, hiddenRareCount } = useMemo(
    () =>
      buildRowList(mainNodes, columns, filters, {
        topN,
        hideRareThreshold: hideRareEnabled ? hideRareThreshold : null,
        otherExpanded,
      }),
    [mainNodes, columns, filters, topN, hideRareEnabled, hideRareThreshold, otherExpanded],
  )

  const activityStats = useMemo(
    () => computeActivity(currentParentId, [...selectedSiteIds], filters.statuses),
    [currentParentId, selectedSiteIds, filters.statuses],
  )

  const allRows = [...pinnedRows, ...mainRows, ...(otherRow ? [otherRow] : [])]
  const globalMax = Math.max(1, ...allRows.flatMap((r) => [...r.counts.values()]))

  return (
    <div className="mx-auto max-w-6xl rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
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
      />

      <div className="mt-5 flex flex-wrap items-end justify-between gap-6 border-t border-neutral-100 pt-5">
        <HeatmapLegend mode={colorMode} onModeChange={state.setColorMode} globalMax={globalMax} />
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

      <div className="mt-4">
        <Breadcrumb path={breadcrumb} onNavigate={state.goToBreadcrumb} />
      </div>

      <div className="mt-3 flex flex-col gap-6 pb-8 lg:flex-row">
        <div className="min-w-0 flex-1">
          <HeatmapGrid
            pinnedRows={pinnedRows}
            pinned={pinned}
            mainRows={mainRows}
            otherRow={otherRow}
            columns={columns}
            colorMode={colorMode}
            showCounts={showCounts}
            onTogglePin={state.togglePin}
            onToggleStar={state.toggleStar}
            onDrillInto={state.drillInto}
            otherExpanded={otherExpanded}
            onToggleOtherExpanded={() => state.setOtherExpanded((v) => !v)}
            highlightedTaxonId={highlightedTaxonId}
          />
        </div>
        <div className="w-full shrink-0 lg:w-56">
          <ActivityPanel stats={activityStats} />
        </div>
      </div>
    </div>
  )
}
