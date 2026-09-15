import { useCallback, useMemo, useState } from 'react'
import { sites } from '../data/sites'
import type { DetectionStatus } from '../data/types'
import { defaultFilters } from '../lib/aggregate'
import { getAncestors, nodeById } from '../lib/taxonomyTree'

export type ColorMode = 'relative' | 'absolute'

const HIDE_RARE_THRESHOLD = 5
const TOP_N = 20

export function useHeatmapState() {
  const [start, setStart] = useState(defaultFilters().start)
  const [end, setEnd] = useState(defaultFilters().end)
  const [statuses, setStatuses] = useState<Set<DetectionStatus>>(
    new Set<DetectionStatus>(['verified', 'pending']),
  )
  const [selectedSiteIds, setSelectedSiteIds] = useState<Set<string>>(
    new Set(sites.map((s) => s.id)),
  )
  const [groupByHabitat, setGroupByHabitat] = useState(false)
  const [filtersOpen, setFiltersOpen] = useState(false)

  const [drillPath, setDrillPath] = useState<string[]>([])
  const [pinned, setPinned] = useState<Set<string>>(new Set())
  const [colorMode, setColorMode] = useState<ColorMode>('relative')
  const [showCounts, setShowCounts] = useState(false)
  const [hideRareEnabled, setHideRareEnabled] = useState(false)
  const [otherExpanded, setOtherExpanded] = useState(false)
  const [highlightedTaxonId, setHighlightedTaxonId] = useState<string | null>(null)

  const filters = useMemo(() => ({ start, end, statuses }), [start, end, statuses])

  const currentParentId = drillPath.length ? drillPath[drillPath.length - 1] : null

  const drillInto = useCallback((taxonId: string) => {
    setDrillPath((path) => [...path, taxonId])
    setOtherExpanded(false)
    setHighlightedTaxonId(null)
  }, [])

  const goToBreadcrumb = useCallback((index: number) => {
    // index -1 = root ("All"); 0..n-1 = position within drillPath
    setDrillPath((path) => (index < 0 ? [] : path.slice(0, index + 1)))
    setOtherExpanded(false)
    setHighlightedTaxonId(null)
  }, [])

  const togglePin = useCallback((taxonId: string) => {
    setPinned((prev) => {
      const next = new Set(prev)
      if (next.has(taxonId)) next.delete(taxonId)
      else next.add(taxonId)
      return next
    })
  }, [])

  const toggleSite = useCallback((siteId: string) => {
    setSelectedSiteIds((prev) => {
      const next = new Set(prev)
      if (next.has(siteId)) next.delete(siteId)
      else next.add(siteId)
      return next
    })
  }, [])

  const setAllSites = useCallback((on: boolean) => {
    setSelectedSiteIds(on ? new Set(sites.map((s) => s.id)) : new Set())
  }, [])

  const setDateRange = useCallback((newStart: number, newEnd: number) => {
    setStart(newStart)
    setEnd(newEnd)
  }, [])

  const toggleStatus = useCallback((status: DetectionStatus) => {
    setStatuses((prev) => {
      const next = new Set(prev)
      if (next.has(status)) {
        if (next.size > 1) next.delete(status) // never allow zero statuses selected
      } else {
        next.add(status)
      }
      return next
    })
  }, [])

  /** Drill down to a species' parent level and highlight it, expanding "Other" if it's tucked inside one. */
  const jumpToSpecies = useCallback((speciesId: string) => {
    const ancestors = getAncestors(speciesId) // [Class, Order, Family, Genus, Species]
    const path = ancestors.slice(0, -1).map((n) => n.id)
    setDrillPath(path)
    setOtherExpanded(true)
    setHighlightedTaxonId(speciesId)
  }, [])

  const breadcrumb = useMemo(
    () => drillPath.map((id) => nodeById.get(id)).filter((n): n is NonNullable<typeof n> => n !== undefined),
    [drillPath],
  )

  return {
    filters,
    groupByHabitat,
    setGroupByHabitat,
    selectedSiteIds,
    toggleSite,
    setAllSites,
    setDateRange,
    toggleStatus,
    filtersOpen,
    setFiltersOpen,
    currentParentId,
    drillPath,
    breadcrumb,
    drillInto,
    goToBreadcrumb,
    pinned,
    togglePin,
    colorMode,
    setColorMode,
    showCounts,
    setShowCounts,
    hideRareEnabled,
    setHideRareEnabled,
    hideRareThreshold: HIDE_RARE_THRESHOLD,
    topN: TOP_N,
    otherExpanded,
    setOtherExpanded,
    highlightedTaxonId,
    setHighlightedTaxonId,
    jumpToSpecies,
  }
}

export type HeatmapState = ReturnType<typeof useHeatmapState>
