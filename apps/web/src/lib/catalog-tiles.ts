import { LAB_OPTIONS, type LabId } from '@/contexts/lab'
import { getCatalogConcepts } from '@/features/curriculum/lesson-catalog'

export interface CatalogTile {
  labId: LabId
  labLabel: string
  slug: string
  title: string
  summary: string
  difficulty: string
  status: 'available' | 'coming-soon'
}

/** Build tiles from the in-memory lab catalog (load catalog from API before calling). */
export function getAllCatalogTiles(): CatalogTile[] {
  const out: CatalogTile[] = []
  for (const { id, label } of LAB_OPTIONS) {
    for (const c of getCatalogConcepts(id)) {
      out.push({
        labId: id,
        labLabel: label,
        slug: c.slug,
        title: c.title,
        summary: c.summary,
        difficulty: c.difficulty,
        status: c.status,
      })
    }
  }
  return out
}

/** Two-letter “symbol” from title / slug (periodic-table style). */
export function tileSymbol(title: string, slug: string): string {
  const words = title.split(/\s+/).filter(Boolean)
  if (words.length >= 2 && words[0][0] && words[1][0]) {
    return (words[0][0] + words[1][0]).toUpperCase()
  }
  const compact = slug.replace(/-/g, '')
  if (compact.length >= 2) return compact.slice(0, 2).toUpperCase()
  return (title.slice(0, 2) || '??').toUpperCase()
}
