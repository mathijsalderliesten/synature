export type Rank = 'Class' | 'Species'

export interface Site {
  id: string
  name: string
  habitat: string
}

export interface TaxonNode {
  id: string
  name: string
  commonName?: string
  rank: Rank
  parentId: string | null
}

export type DetectionStatus = 'verified' | 'pending'

export interface Detection {
  speciesId: string
  siteId: string
  timestamp: number
  status: DetectionStatus
}
