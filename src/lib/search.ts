import { taxonomy } from '../data/taxonomy'
import { getAncestors } from './taxonomyTree'

const allSpecies = taxonomy.filter((n) => n.rank === 'Species')

export interface SearchMatch {
  id: string
  name: string
  commonName?: string
  path: string
}

export function searchSpecies(query: string, limit = 8): SearchMatch[] {
  const q = query.trim().toLowerCase()
  if (!q) return []
  const matches = allSpecies.filter(
    (s) => s.name.toLowerCase().includes(q) || s.commonName?.toLowerCase().includes(q),
  )
  return matches.slice(0, limit).map((s) => {
    const ancestors = getAncestors(s.id)
    const path = ancestors
      .slice(0, -1)
      .map((a) => a.name)
      .join(' / ')
    return { id: s.id, name: s.name, commonName: s.commonName, path }
  })
}
