import type { LabId } from '@/contexts/lab'

/**
 * Labs that support per-concept completion tracking.
 * Every lab whose concepts can be individually marked done should be listed here.
 */
const LABS_WITH_CONCEPT_COMPLETION = new Set<LabId>([
  'system-design',
  'api-design',
  'design-patterns',
  'data-science',
  'cloud-architecture',
  'database-design',
  'low-level-systems',
])

export function labTracksConceptProgress(labId: LabId): boolean {
  return LABS_WITH_CONCEPT_COMPLETION.has(labId)
}
