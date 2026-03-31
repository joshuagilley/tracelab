import type { Concept } from '@/types/concept'
import type { CurriculumNavSection } from '@/types/curriculum-nav'
import type { ProgrammingLanguage } from '@/types/programming-language'

/** One row from a lab catalog — lightweight list metadata only. */
export interface LessonCatalogRow extends Concept {
  labKind: string
  vizType: string
  codeFiles: { name: string; lang: string }[]
}

/** Shape of every lab catalog document from Mongo (minus _id). */
export interface LabCatalogFile {
  panelPrefix: string
  navSections?: CurriculumNavSection[]
  languages?: ProgrammingLanguage[]
  defaultOpenSectionIds?: string[]
  concepts: LessonCatalogRow[]
}

/** Sidebar nav configuration derived from a lab catalog. */
export interface LabNavConfig {
  panelPrefix: string
  navSections: CurriculumNavSection[]
  defaultOpenSectionIds?: string[]
  languages?: ProgrammingLanguage[]
}
