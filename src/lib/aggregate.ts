import { detectionIndex, detectionWindow } from '../data/detections'
import type { Site } from '../data/types'
import type { DetectionStatus } from '../data/types'
import { getDescendantSpeciesIds, rootTaxa } from './taxonomyTree'

export interface Filters {
  start: number
  end: number
  statuses: Set<DetectionStatus>
}

export function defaultFilters(): Filters {
  return {
    start: detectionWindow.start,
    end: detectionWindow.end,
    statuses: new Set<DetectionStatus>(['verified', 'pending']),
  }
}

/** One heatmap column: either a single site, or all sites sharing a habitat. */
export interface Column {
  id: string
  label: string
  siteIds: string[]
}

export function buildColumns(sites: Site[], selectedSiteIds: Set<string>, groupByHabitat: boolean): Column[] {
  const selected = sites.filter((s) => selectedSiteIds.has(s.id))
  if (!groupByHabitat) {
    return selected.map((s) => ({ id: s.id, label: s.name, siteIds: [s.id] }))
  }
  const byHabitat = new Map<string, Site[]>()
  for (const s of selected) {
    const list = byHabitat.get(s.habitat) ?? []
    list.push(s)
    byHabitat.set(s.habitat, list)
  }
  return [...byHabitat.entries()].map(([habitat, group]) => ({
    id: habitat,
    label: habitat,
    siteIds: group.map((s) => s.id),
  }))
}

function lowerBound(arr: { timestamp: number }[], target: number): number {
  let lo = 0
  let hi = arr.length
  while (lo < hi) {
    const mid = (lo + hi) >>> 1
    if (arr[mid].timestamp < target) lo = mid + 1
    else hi = mid
  }
  return lo
}

function countLeaf(
  speciesId: string,
  siteId: string,
  start: number,
  end: number,
  statuses: Set<DetectionStatus>,
): number {
  const arr = detectionIndex.get(speciesId)?.get(siteId)
  if (!arr || arr.length === 0) return 0
  const lo = lowerBound(arr, start)
  const hi = lowerBound(arr, end)
  if (statuses.size === 2) return hi - lo
  let count = 0
  for (let i = lo; i < hi; i++) {
    if (statuses.has(arr[i].status)) count++
  }
  return count
}

/** Detection count for a taxon over an arbitrary set of sites and date range. */
export function scopeCount(
  taxonId: string,
  siteIds: string[],
  start: number,
  end: number,
  statuses: Set<DetectionStatus>,
): number {
  const speciesIds = getDescendantSpeciesIds(taxonId)
  let sum = 0
  for (const sp of speciesIds) {
    for (const site of siteIds) sum += countLeaf(sp, site, start, end, statuses)
  }
  return sum
}

/** Like scopeCount, but taxonId=null sums across all root (Class-level) taxa. */
export function totalScopeCount(
  taxonId: string | null,
  siteIds: string[],
  start: number,
  end: number,
  statuses: Set<DetectionStatus>,
): number {
  if (taxonId === null) {
    return rootTaxa.reduce((sum, t) => sum + scopeCount(t.id, siteIds, start, end, statuses), 0)
  }
  return scopeCount(taxonId, siteIds, start, end, statuses)
}

export function cellCount(taxonId: string, column: Column, filters: Filters): number {
  return scopeCount(taxonId, column.siteIds, filters.start, filters.end, filters.statuses)
}

/** Per-column counts for a taxon, keyed by column id. */
export function rowCounts(taxonId: string, columns: Column[], filters: Filters): Map<string, number> {
  const result = new Map<string, number>()
  for (const col of columns) result.set(col.id, cellCount(taxonId, col, filters))
  return result
}

export function sumCounts(counts: Map<string, number>): number {
  let sum = 0
  for (const v of counts.values()) sum += v
  return sum
}
