import type { Concept } from '@/types/concept'
import type { LabId } from '@/contexts/lab'
import type { LabConceptDetail, LabParameter } from '@/types/labConcept'

import aiSystems from '@/features/ai-systems/ai-systems.json'
import algorithms from '@/features/algorithms/algorithms.json'
import apiDesign from '@/features/api-design/api-design.json'
import cloudArchitecture from '@/features/cloud-architecture/cloud-architecture.json'
import concurrency from '@/features/concurrency/concurrency.json'
import databaseDesign from '@/features/database-design/database-design.json'
import dataScience from '@/features/data-science/data-science.json'
import designPatterns from '@/features/design-patterns/design-patterns.json'
import devops from '@/features/devops/devops.json'
import lowLevelSystems from '@/features/low-level-systems/low-level-systems.json'
import networking from '@/features/networking/networking.json'
import programmingLanguages from '@/features/programming-languages/programming-languages.json'
import security from '@/features/security/security.json'
import softwareArchitecture from '@/features/software-architecture/software-architecture.json'
import systemDesign from '@/features/system-design/system-design.json'
import testing from '@/features/testing/testing.json'

/** One row from catalog JSON (code file bodies filled later via `attachLessonSourceCode`). */
export interface LessonCatalogRow extends Concept {
  labKind: string
  vizType: string
  codeFiles: { name: string; lang: string }[]
  parameters?: LabParameter[]
}

const BY_SECTION: Record<LabId, LessonCatalogRow[]> = {
  'ai-systems': aiSystems as LessonCatalogRow[],
  algorithms: algorithms as LessonCatalogRow[],
  'api-design': apiDesign as LessonCatalogRow[],
  'cloud-architecture': cloudArchitecture as LessonCatalogRow[],
  concurrency: concurrency as LessonCatalogRow[],
  'database-design': databaseDesign as LessonCatalogRow[],
  'data-science': dataScience as LessonCatalogRow[],
  'design-patterns': designPatterns as LessonCatalogRow[],
  devops: devops as LessonCatalogRow[],
  'low-level-systems': lowLevelSystems as LessonCatalogRow[],
  networking: networking as LessonCatalogRow[],
  'programming-languages': programmingLanguages as LessonCatalogRow[],
  security: security as LessonCatalogRow[],
  'software-architecture': softwareArchitecture as LessonCatalogRow[],
  'system-design': systemDesign as LessonCatalogRow[],
  testing: testing as LessonCatalogRow[],
}

const slugIndex = new Map<LabId, Map<string, LessonCatalogRow>>()

function indexFor(section: LabId): Map<string, LessonCatalogRow> {
  let m = slugIndex.get(section)
  if (!m) {
    m = new Map()
    for (const row of BY_SECTION[section] ?? []) {
      m.set(row.slug, row)
    }
    slugIndex.set(section, m)
  }
  return m
}

export function getCatalogConcepts(section: LabId): Concept[] {
  return (BY_SECTION[section] ?? []).map(row => {
    const { id, title, slug, summary, difficulty, tags, status } = row
    return { id, title, slug, summary, difficulty, tags, status }
  })
}

export function getCatalogLesson(section: LabId, slug: string): LabConceptDetail | null {
  const row = indexFor(section).get(slug)
  if (!row) return null
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    summary: row.summary,
    difficulty: row.difficulty,
    tags: row.tags,
    status: row.status,
    labKind: row.labKind,
    vizType: row.vizType,
    codeFiles: row.codeFiles.map(f => ({ name: f.name, lang: f.lang, code: '' })),
    parameters: row.parameters,
  }
}
