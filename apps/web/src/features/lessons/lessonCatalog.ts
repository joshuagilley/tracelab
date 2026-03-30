import type { Concept } from '@/types/concept'
import type { LabId } from '@/contexts/lab'
import type { LabConceptDetail } from '@/types/labConcept'
import type { CurriculumNavSection } from '@/types/curriculumNav'
import type { ProgrammingLanguage } from '@/types/programmingLanguage'
import { CONCEPT_DETAIL_REGISTRY } from './conceptDetailRegistry'

import aiSystems          from '@/features/ai-systems/ai-systems.json'
import algorithms         from '@/features/algorithms/algorithms.json'
import apiDesign          from '@/features/api-design/api-design.json'
import cloudArchitecture  from '@/features/cloud-architecture/cloud-architecture.json'
import concurrency        from '@/features/concurrency/concurrency.json'
import databaseDesign     from '@/features/database-design/database-design.json'
import dataScience        from '@/features/data-science/data-science.json'
import designPatterns     from '@/features/design-patterns/design-patterns.json'
import devops             from '@/features/devops/devops.json'
import lowLevelSystems    from '@/features/low-level-systems/low-level-systems.json'
import networking         from '@/features/networking/networking.json'
import operatingSystems   from '@/features/operating-systems/operating-systems.json'
import programmingLanguages from '@/features/programming-languages/programming-languages.json'
import security           from '@/features/security/security.json'
import softwareArchitecture from '@/features/software-architecture/software-architecture.json'
import systemDesign       from '@/features/system-design/system-design.json'
import testing            from '@/features/testing/testing.json'

/** One row from a lab catalog JSON — lightweight list metadata only. */
export interface LessonCatalogRow extends Concept {
  labKind: string
  vizType: string
  codeFiles: { name: string; lang: string }[]
}

/** Shape of every lab catalog JSON file after the nav merge. */
interface LabCatalogFile {
  panelPrefix: string
  navSections?: CurriculumNavSection[]
  languages?: ProgrammingLanguage[]
  defaultOpenSectionIds?: string[]
  concepts: LessonCatalogRow[]
}

/** Nav configuration returned from getCatalogNavConfig. */
export interface LabNavConfig {
  panelPrefix: string
  navSections: CurriculumNavSection[]
  defaultOpenSectionIds?: string[]
  /** Only present for the programming-languages lab. */
  languages?: ProgrammingLanguage[]
}

const BY_SECTION: Record<LabId, LabCatalogFile> = {
  'ai-systems':            aiSystems          as unknown as LabCatalogFile,
  algorithms:              algorithms         as unknown as LabCatalogFile,
  'api-design':            apiDesign          as unknown as LabCatalogFile,
  'cloud-architecture':    cloudArchitecture  as unknown as LabCatalogFile,
  concurrency:             concurrency        as unknown as LabCatalogFile,
  'database-design':       databaseDesign     as unknown as LabCatalogFile,
  'data-science':          dataScience        as unknown as LabCatalogFile,
  'design-patterns':       designPatterns     as unknown as LabCatalogFile,
  devops:                  devops             as unknown as LabCatalogFile,
  'low-level-systems':     lowLevelSystems    as unknown as LabCatalogFile,
  networking:              networking         as unknown as LabCatalogFile,
  'operating-systems':     operatingSystems   as unknown as LabCatalogFile,
  'programming-languages': programmingLanguages as unknown as LabCatalogFile,
  security:                security           as unknown as LabCatalogFile,
  'software-architecture': softwareArchitecture as unknown as LabCatalogFile,
  'system-design':         systemDesign       as unknown as LabCatalogFile,
  testing:                 testing            as unknown as LabCatalogFile,
}

const slugIndex = new Map<LabId, Map<string, LessonCatalogRow>>()

function indexFor(section: LabId): Map<string, LessonCatalogRow> {
  let m = slugIndex.get(section)
  if (!m) {
    m = new Map()
    for (const row of BY_SECTION[section]?.concepts ?? []) {
      m.set(row.slug, row)
    }
    slugIndex.set(section, m)
  }
  return m
}

export function getCatalogConcepts(section: LabId): Concept[] {
  return (BY_SECTION[section]?.concepts ?? []).map(row => {
    const { id, title, slug, summary, difficulty, tags, status } = row
    return { id, title, slug, summary, difficulty, tags, status }
  })
}

/** Returns sidebar nav configuration (sections, panelPrefix, defaultOpen) for a lab. */
export function getCatalogNavConfig(section: LabId): LabNavConfig | null {
  const file = BY_SECTION[section]
  if (!file) return null
  return {
    panelPrefix:          file.panelPrefix,
    navSections:          file.navSections ?? [],
    defaultOpenSectionIds: file.defaultOpenSectionIds,
    languages:            file.languages,
  }
}

export function getCatalogLesson(section: LabId, slug: string): LabConceptDetail | null {
  const row = indexFor(section).get(slug)
  if (!row) return null

  const detail = CONCEPT_DETAIL_REGISTRY[section]?.[slug]

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
    codeFiles: detail?.codeFiles
      ? detail.codeFiles.map(f => ({
          name: f.name,
          lang: f.lang,
          code: f.code,
          role: f.role as 'present' | 'bad' | 'exercise' | undefined,
        }))
      : row.codeFiles.map(f => ({ name: f.name, lang: f.lang, code: '' })),
    parameters:   detail?.parameters,
    metricGroups: detail?.metricGroups,
    practice:     detail?.practice,
  }
}
