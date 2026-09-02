import { detectionIndex, detectionWindow } from '../data/detections'
import type { DetectionStatus } from '../data/types'
import { getDescendantSpeciesIds } from './taxonomyTree'

export interface Filters {
  start: number
  end: number
  statuses: Set<DetectionStatus>
  siteIds: string[]
}

export function defaultFilters(allSiteIds: string[]): Filters {
  return {
    start: detectionWindow.start,
    end: detectionWindow.end,
    statuses: new Set<DetectionStatus>(['verified', 'pending']),
    siteIds: allSiteIds,
  }
}

/** Count detections for one species at one site within [start, end], via binary search. */
function countRange(speciesId: string, siteId: string, filters: Filters): number {
  const arr = detectionIndex.get(speciesId)?.get(siteId)
  if (!arr || arr.length === 0) return 0
  let lo = lowerBound(arr, filters.start)
  const hi = lowerBound(arr, filters.end)
  const bothStatuses = filters.statuses.size === 2
  if (bothStatuses) return hi - lo
  let count = 0
  for (let i = lo; i < hi; i++) {
    if (filters.statuses.has(arr[i].status)) count++
  }
  return count
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

/** Detection count for a taxon (aggregated over all descendant species) at one site. */
export function cellCount(taxonId: string, siteId: string, filters: Filters): number {
  const speciesIds = getDescendantSpeciesIds(taxonId)
  let sum = 0
  for (const sp of speciesIds) sum += countRange(sp, siteId, filters)
  return sum
}

/** Per-site counts for a taxon, keyed by siteId, over the filtered sites. */
export function rowCounts(taxonId: string, filters: Filters): Map<string, number> {
  const speciesIds = getDescendantSpeciesIds(taxonId)
  const result = new Map<string, number>()
  for (const siteId of filters.siteIds) {
    let sum = 0
    for (const sp of speciesIds) sum += countRange(sp, siteId, filters)
    result.set(siteId, sum)
  }
  return result
}

export function rowTotal(taxonId: string, filters: Filters): number {
  const counts = rowCounts(taxonId, filters)
  let sum = 0
  for (const v of counts.values()) sum += v
  return sum
}
