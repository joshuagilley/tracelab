import type { LabId } from '@/contexts/lab'
import type { LabConceptDetail } from '@/types/labConcept'
import { LESSON_CODE_BY_LAB_AND_SLUG } from '@/features/lessons/lessonSourceRegistry'

/** Merge co-located ?raw sources into the catalog lesson (metadata-only codeFiles until this runs). */
export function attachLessonSourceCode(labId: LabId, lesson: LabConceptDetail): LabConceptDetail {
  const bundle = LESSON_CODE_BY_LAB_AND_SLUG[labId]?.[lesson.slug]
  if (!bundle || !lesson.codeFiles?.length) return lesson

  return {
    ...lesson,
    codeFiles: lesson.codeFiles.map(f => ({
      ...f,
      code: bundle[f.name] ?? f.code ?? '',
    })),
  }
}
