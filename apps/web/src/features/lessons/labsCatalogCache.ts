import { LAB_OPTIONS, type LabId } from '@/contexts/lab'
import { API_BASE } from '@/lib/apiBase'
import type { LabCatalogFile } from '@/features/lessons/labCatalogTypes'

const LAB_IDS = new Set<LabId>(LAB_OPTIONS.map(o => o.id))

let cache: Partial<Record<LabId, LabCatalogFile>> | null = null

function normalizeLabDoc(raw: Record<string, unknown>): LabCatalogFile {
  const { _id: _idDrop, lab: labDrop, ...rest } = raw
  void _idDrop
  void labDrop
  return rest as unknown as LabCatalogFile
}

/**
 * Fetches all lab catalog documents from the API and fills the in-memory cache.
 * Call once at app startup before using getCachedLabCatalog / getCatalogConcepts.
 */
export async function fetchLabsCatalogIntoCache(): Promise<void> {
  const res = await fetch(`${API_BASE}/catalog/labs`)
  if (!res.ok) {
    throw new Error(`catalog/labs: ${res.status}`)
  }
  const data = (await res.json()) as { labs?: unknown[] }
  const labs = data.labs ?? []
  const byLab: Partial<Record<LabId, LabCatalogFile>> = {}
  for (const item of labs) {
    if (!item || typeof item !== 'object') continue
    const doc = item as Record<string, unknown>
    const id = (typeof doc._id === 'string' ? doc._id : doc.lab) as string | undefined
    if (!id || !LAB_IDS.has(id as LabId)) continue
    byLab[id as LabId] = normalizeLabDoc(doc)
  }
  cache = byLab
}

export function getCachedLabCatalog(labId: LabId): LabCatalogFile | undefined {
  return cache?.[labId]
}
