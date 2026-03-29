import type { Concept } from '@/types/concept'
import type { LabConceptDetail } from '@/types/labConcept'
import type { LabId } from '@/contexts/lab'
import { attachLessonSourceCode } from '@/features/lessons/attachLessonSourceCode'
import { getCatalogConcepts, getCatalogLesson } from '@/features/lessons/lessonCatalog'

export async function fetchSectionConcepts(section: LabId): Promise<Concept[]> {
  return getCatalogConcepts(section)
}

export async function fetchSectionLesson(section: LabId, slug: string): Promise<LabConceptDetail> {
  const lesson = getCatalogLesson(section, slug)
  if (!lesson) throw new Error(`Lesson "${slug}" not found`)
  return attachLessonSourceCode(section, lesson)
}
