import type { Rank, TaxonNode } from '../data/types'
import type { Column, Filters } from './aggregate'
import { rowCounts, sumCounts } from './aggregate'
import { getChildren } from './taxonomyTree'

export interface RowEntry {
  id: string
  name: string
  commonName?: string
  rank?: Rank
  taxonId: string
  isOther: boolean
  otherCount?: number
  counts: Map<string, number>
  total: number
}

export function buildRowEntry(node: TaxonNode, columns: Column[], filters: Filters): RowEntry {
  const counts = rowCounts(node.id, columns, filters)
  return {
    id: node.id,
    name: node.name,
    commonName: node.commonName,
    rank: node.rank,
    taxonId: node.id,
    isOther: false,
    counts,
    total: sumCounts(counts),
  }
}

export interface BuiltRowList {
  rows: RowEntry[]
  otherRow: RowEntry | null
  hiddenRareCount: number
}

export function buildRowList(
  nodes: TaxonNode[],
  columns: Column[],
  filters: Filters,
  opts: { topN: number; hideRareThreshold: number | null; otherExpanded: boolean },
): BuiltRowList {
  let entries = nodes.map((n) => buildRowEntry(n, columns, filters))
  entries.sort((a, b) => b.total - a.total)

  let hiddenRareCount = 0
  if (opts.hideRareThreshold !== null) {
    const kept = entries.filter((e) => e.total >= opts.hideRareThreshold!)
    hiddenRareCount = entries.length - kept.length
    entries = kept
  }

  if (opts.otherExpanded || entries.length <= opts.topN) {
    return { rows: entries, otherRow: null, hiddenRareCount }
  }

  const top = entries.slice(0, opts.topN)
  const rest = entries.slice(opts.topN)
  const columnSums = new Map<string, number>()
  for (const col of columns) columnSums.set(col.id, 0)
  let total = 0
  for (const e of rest) {
    total += e.total
    for (const col of columns) columnSums.set(col.id, (columnSums.get(col.id) ?? 0) + (e.counts.get(col.id) ?? 0))
  }

  const otherRow: RowEntry = {
    id: '__other__',
    name: `Other (${rest.length} species)`,
    taxonId: '__other__',
    isOther: true,
    otherCount: rest.length,
    counts: columnSums,
    total,
  }

  return { rows: top, otherRow, hiddenRareCount }
}

export interface ClassSection {
  classRow: RowEntry
  speciesRows: RowEntry[]
  otherRow: RowEntry | null
  hiddenRareCount: number
}

/** One section per Class, each with its own (unpinned) species top-N + Other, sorted by class total. */
export function buildClassSections(
  classNodes: TaxonNode[],
  columns: Column[],
  filters: Filters,
  pinned: Set<string>,
  opts: { topN: number; hideRareThreshold: number | null; otherExpandedClassIds: Set<string> },
): ClassSection[] {
  const sections = classNodes.map((classNode): ClassSection => {
    const classRow = buildRowEntry(classNode, columns, filters)
    const speciesNodes = getChildren(classNode.id).filter((n) => !pinned.has(n.id))
    const { rows, otherRow, hiddenRareCount } = buildRowList(speciesNodes, columns, filters, {
      topN: opts.topN,
      hideRareThreshold: opts.hideRareThreshold,
      otherExpanded: opts.otherExpandedClassIds.has(classNode.id),
    })
    return { classRow, speciesRows: rows, otherRow, hiddenRareCount }
  })
  sections.sort((a, b) => b.classRow.total - a.classRow.total)
  return sections
}
