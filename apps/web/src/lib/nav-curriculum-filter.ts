import type { Concept } from '@/types/concept'
import type {
  ProgrammingLanguage,
  ProgrammingLanguageCategory,
} from '@/types/programming-language'
import type { CurriculumFilterMode } from '@/lib/track-filter'
import { conceptVisibleForMode } from '@/lib/track-filter'

export type NavSectionShape = {
  id: string
  title: string
  blurb: string
  items: readonly { label: string; slug?: string }[]
}

/** Drop nav rows without a live lesson; remove empty accordion sections. */
export function filterCurriculumSections<T extends NavSectionShape>(
  sections: readonly T[],
  bySlug: Record<string, Concept | undefined>,
  mode: CurriculumFilterMode,
  trackTags: readonly string[],
): T[] {
  if (mode === 'all') return [...sections]
  return sections
    .map(s => ({
      ...s,
      items: s.items.filter(it => {
        if (!it.slug) return false
        const c = bySlug[it.slug]
        if (!c) return false
        return conceptVisibleForMode(c, mode, trackTags)
      }),
    }))
    .filter(s => s.items.length > 0)
}

export function filterProgrammingLanguages(
  langs: ProgrammingLanguage[],
  bySlug: Record<string, Concept | undefined>,
  mode: CurriculumFilterMode,
  trackTags: readonly string[],
): ProgrammingLanguage[] {
  if (mode === 'all') return langs
  return langs
    .map(lang => ({
      ...lang,
      categories: lang.categories
        .map(
          (cat: ProgrammingLanguageCategory): ProgrammingLanguageCategory => ({
            ...cat,
            items: cat.items.filter(it => {
              if (!it.slug) return false
              const c = bySlug[it.slug]
              if (!c) return false
              return conceptVisibleForMode(c, mode, trackTags)
            }),
          }),
        )
        .filter(cat => cat.items.length > 0),
    }))
    .filter(lang => lang.categories.length > 0)
}
