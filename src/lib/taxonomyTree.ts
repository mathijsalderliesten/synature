import { taxonomy } from '../data/taxonomy'
import type { Rank, TaxonNode } from '../data/types'

export const nodeById = new Map(taxonomy.map((n) => [n.id, n]))

const childrenOf = new Map<string | null, TaxonNode[]>()
for (const node of taxonomy) {
  const list = childrenOf.get(node.parentId) ?? []
  list.push(node)
  childrenOf.set(node.parentId, list)
}

export function getChildren(taxonId: string | null): TaxonNode[] {
  return childrenOf.get(taxonId) ?? []
}

export const rootTaxa: TaxonNode[] = getChildren(null)

export function getAncestors(taxonId: string): TaxonNode[] {
  const path: TaxonNode[] = []
  let cur = nodeById.get(taxonId)
  while (cur) {
    path.unshift(cur)
    cur = cur.parentId ? nodeById.get(cur.parentId) : undefined
  }
  return path
}

const leafCache = new Map<string, string[]>()

/** All descendant Species ids under a taxon node (or itself, if already a Species). */
export function getDescendantSpeciesIds(taxonId: string): string[] {
  const cached = leafCache.get(taxonId)
  if (cached) return cached
  const node = nodeById.get(taxonId)
  if (!node) return []
  let result: string[]
  if (node.rank === 'Species') {
    result = [node.id]
  } else {
    result = getChildren(taxonId).flatMap((child) => getDescendantSpeciesIds(child.id))
  }
  leafCache.set(taxonId, result)
  return result
}

export const nextRank: Partial<Record<Rank, Rank>> = {
  Class: 'Order',
  Order: 'Family',
  Family: 'Genus',
  Genus: 'Species',
}
