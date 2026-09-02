import type { DetectionStatus } from '../data/types'
import { totalScopeCount } from './aggregate'

const DAY_MS = 24 * 60 * 60 * 1000

export interface PeriodStat {
  label: string
  count: number
  deltaPct: number | null
}

function period(
  scopeTaxonId: string | null,
  siteIds: string[],
  statuses: Set<DetectionStatus>,
  now: number,
  lengthMs: number,
  label: string,
): PeriodStat {
  const currentCount = totalScopeCount(scopeTaxonId, siteIds, now - lengthMs, now, statuses)
  const previousCount = totalScopeCount(scopeTaxonId, siteIds, now - 2 * lengthMs, now - lengthMs, statuses)
  const deltaPct = previousCount === 0 ? (currentCount === 0 ? 0 : null) : ((currentCount - previousCount) / previousCount) * 100
  return { label, count: currentCount, deltaPct }
}

export function computeActivity(
  scopeTaxonId: string | null,
  siteIds: string[],
  statuses: Set<DetectionStatus>,
): PeriodStat[] {
  const now = Date.now()
  return [
    period(scopeTaxonId, siteIds, statuses, now, DAY_MS, 'Today'),
    period(scopeTaxonId, siteIds, statuses, now, 7 * DAY_MS, 'This week'),
    period(scopeTaxonId, siteIds, statuses, now, 30 * DAY_MS, 'This month'),
  ]
}
