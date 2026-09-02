import { taxonomy } from './taxonomy'
import { sites } from './sites'
import { birdSiteCounts } from './birdCounts.generated'
import { hashSeed, mulberry32 } from './rng'
import type { Detection, DetectionStatus } from './types'

const DAY_MS = 24 * 60 * 60 * 1000
const WINDOW_DAYS = 90
const now = Date.now()
const windowStart = now - WINDOW_DAYS * DAY_MS

const speciesNodes = taxonomy.filter((n) => n.rank === 'Species')
const speciesClass = new Map<string, string>()
{
  const parentOf = new Map(taxonomy.map((n) => [n.id, n.parentId]))
  const nodeById = new Map(taxonomy.map((n) => [n.id, n]))
  for (const sp of speciesNodes) {
    let cur = sp.parentId
    while (cur) {
      const node = nodeById.get(cur)
      if (!node) break
      if (node.rank === 'Class') {
        speciesClass.set(sp.id, node.id)
        break
      }
      cur = parentOf.get(cur) ?? null
    }
  }
}

/** Synthetic per-site totals for non-bird species (birds use real CSV counts). */
function syntheticRange(speciesId: string): [number, number] {
  const cls = speciesClass.get(speciesId)
  if (cls === 'class-mammals') {
    if (speciesId.startsWith('pipistrellus') || speciesId.startsWith('nyctalus'))
      return [4, 55]
    if (speciesId.startsWith('eptesicus') || speciesId.startsWith('myotis')) return [2, 30]
    if (speciesId.startsWith('rhinolophus') || speciesId.startsWith('barbastella') || speciesId.startsWith('plecotus'))
      return [0, 12]
    return [0, 18] // fox, badger, deer
  }
  if (cls === 'class-amphibians') return [0, 35]
  if (cls === 'class-insects') return [0, 45]
  return [0, 10]
}

interface SiteCount {
  speciesId: string
  siteId: string
  total: number
}

const siteCounts: SiteCount[] = []
for (const [slug, siteId, n] of birdSiteCounts) {
  siteCounts.push({ speciesId: slug.toLowerCase().replace(/_/g, '-'), siteId, total: n })
}
for (const sp of speciesNodes) {
  const cls = speciesClass.get(sp.id)
  if (cls === 'class-birds') continue
  const [lo, hi] = syntheticRange(sp.id)
  for (const site of sites) {
    const rand = mulberry32(hashSeed(`${sp.id}::${site.id}`))
    // Patchy presence: many species are absent from most sites.
    const present = rand() > 0.35
    if (!present) continue
    const t = rand() ** 1.6 // skew toward the low end, like the real bird data
    const total = Math.round(lo + t * (hi - lo))
    if (total > 0) siteCounts.push({ speciesId: sp.id, siteId: site.id, total })
  }
}

/** Per-class hour-of-day activity profile, returns an hour in [0, 24). */
function sampleHour(cls: string | undefined, rand: () => number): number {
  const gauss = () => {
    let u = 0
    let v = 0
    while (u === 0) u = rand()
    while (v === 0) v = rand()
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v)
  }
  let center: number
  if (cls === 'class-mammals') {
    center = rand() < 0.5 ? 22 : 3 // nocturnal bats/mammals, wraps midnight
  } else if (cls === 'class-amphibians') {
    center = 21
  } else if (cls === 'class-insects') {
    center = rand() < 0.6 ? 13 : 20 // day-singers + evening crickets
  } else {
    center = rand() < 0.55 ? 6.5 : 18.5 // dawn / dusk chorus
  }
  let h = center + gauss() * 1.8
  h = ((h % 24) + 24) % 24
  return h
}

/** Per-species day-of-window activity weights: baseline + a couple of activity pulses. */
function dayWeights(speciesId: string): number[] {
  const rand = mulberry32(hashSeed(`days::${speciesId}`))
  const weights = new Array<number>(WINDOW_DAYS).fill(1)
  const pulses = 1 + Math.floor(rand() * 2)
  for (let p = 0; p < pulses; p++) {
    const peakDay = rand() * WINDOW_DAYS
    const width = 6 + rand() * 16
    const height = 1.5 + rand() * 3.5
    for (let d = 0; d < WINDOW_DAYS; d++) {
      const dist = (d - peakDay) / width
      weights[d] += height * Math.exp(-0.5 * dist * dist)
    }
  }
  return weights
}

const dayWeightCache = new Map<string, number[]>()
function getDayWeights(speciesId: string): number[] {
  let w = dayWeightCache.get(speciesId)
  if (!w) {
    w = dayWeights(speciesId)
    dayWeightCache.set(speciesId, w)
  }
  return w
}

function sampleDayIndex(weights: number[], rand: () => number): number {
  const total = weights.reduce((a, b) => a + b, 0)
  let r = rand() * total
  for (let i = 0; i < weights.length; i++) {
    r -= weights[i]
    if (r <= 0) return i
  }
  return weights.length - 1
}

const detections: Detection[] = []

for (const { speciesId, siteId, total } of siteCounts) {
  const cls = speciesClass.get(speciesId)
  const rand = mulberry32(hashSeed(`gen::${speciesId}::${siteId}`))
  const weights = getDayWeights(speciesId)
  // Rarer detections are less likely to have been reviewed yet.
  const verifiedProb = Math.min(0.95, 0.55 + Math.log10(total + 1) * 0.14)
  for (let i = 0; i < total; i++) {
    const day = sampleDayIndex(weights, rand)
    const hour = sampleHour(cls, rand)
    const timestamp = windowStart + day * DAY_MS + hour * 60 * 60 * 1000 + rand() * 60 * 1000
    const status: DetectionStatus = rand() < verifiedProb ? 'verified' : 'pending'
    detections.push({ speciesId, siteId, timestamp: Math.round(timestamp), status })
  }
}

detections.sort((a, b) => a.timestamp - b.timestamp)

/** speciesId -> siteId -> detections sorted by timestamp, for fast range aggregation. */
export const detectionIndex = new Map<string, Map<string, Detection[]>>()
for (const d of detections) {
  let bySite = detectionIndex.get(d.speciesId)
  if (!bySite) {
    bySite = new Map()
    detectionIndex.set(d.speciesId, bySite)
  }
  let arr = bySite.get(d.siteId)
  if (!arr) {
    arr = []
    bySite.set(d.siteId, arr)
  }
  arr.push(d)
}

export { detections }
export const detectionWindow = { start: windowStart, end: now }
