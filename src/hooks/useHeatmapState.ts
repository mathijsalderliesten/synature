import { useCallback, useMemo, useState } from 'react'
import { sites } from '../data/sites'
import type { DetectionStatus } from '../data/types'
import { defaultFilters } from '../lib/aggregate'
import { nodeById } from '../lib/taxonomyTree'

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

  const [expandedClassIds, setExpandedClassIds] = useState<Set<string>>(new Set())
  const [pinned, setPinned] = useState<Set<string>>(new Set())
  const [colorMode, setColorMode] = useState<ColorMode>('relative')
  const [showCounts, setShowCounts] = useState(false)
  const [hideRareEnabled, setHideRareEnabled] = useState(false)
  const [otherExpandedByClass, setOtherExpandedByClass] = useState<Set<string>>(new Set())
  const [highlightedTaxonId, setHighlightedTaxonId] = useState<string | null>(null)

  const filters = useMemo(() => ({ start, end, statuses }), [start, end, statuses])

  const toggleClassExpanded = useCallback((classId: string) => {
    setExpandedClassIds((prev) => {
      const next = new Set(prev)
      if (next.has(classId)) next.delete(classId)
      else next.add(classId)
      return next
    })
  }, [])

  const toggleOtherExpandedForClass = useCallback((classId: string) => {
    setOtherExpandedByClass((prev) => {
      const next = new Set(prev)
      if (next.has(classId)) next.delete(classId)
      else next.add(classId)
      return next
    })
  }, [])

  const togglePin = useCallback((speciesId: string) => {
    setPinned((prev) => {
      const next = new Set(prev)
      if (next.has(speciesId)) next.delete(speciesId)
      else next.add(speciesId)
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

  /** Expand a species' class (and its "Other" bucket, if it's tucked inside one) and highlight it. */
  const jumpToSpecies = useCallback((speciesId: string) => {
    const species = nodeById.get(speciesId)
    if (!species?.parentId) return
    const classId = species.parentId
    setExpandedClassIds((prev) => new Set(prev).add(classId))
    setOtherExpandedByClass((prev) => new Set(prev).add(classId))
    setHighlightedTaxonId(speciesId)
  }, [])

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
    expandedClassIds,
    toggleClassExpanded,
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
    otherExpandedByClass,
    toggleOtherExpandedForClass,
    highlightedTaxonId,
    setHighlightedTaxonId,
    jumpToSpecies,
  }
}

export type HeatmapState = ReturnType<typeof useHeatmapState>
