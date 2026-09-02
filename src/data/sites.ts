import type { Site } from './types'

// Real monitoring sites from the Rhône valley acoustic network (Synature).
export const sites: Site[] = [
  { id: 'iles-des-clous', name: 'Iles des Clous', habitat: 'Wetland' },
  { id: 'lizerne', name: 'Lizerne', habitat: 'Riverine forest' },
  { id: 'vernayaz', name: 'Vernayaz', habitat: 'Alluvial forest' },
  { id: 'pfynwald-1', name: 'Pfynwald I', habitat: 'Pine forest' },
  { id: 'pfynwald-2', name: 'Pfynwald II', habitat: 'Pine forest' },
  { id: 'les-grangettes', name: 'Les Grangettes', habitat: 'Lake shore' },
  { id: 'visp', name: 'Visp', habitat: 'River confluence' },
  { id: 'illgraben', name: 'Illgraben', habitat: 'Torrent / scree' },
]

export const siteById = new Map(sites.map((s) => [s.id, s]))
