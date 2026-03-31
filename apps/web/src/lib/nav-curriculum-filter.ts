import type { Concept } from '@/types/concept'
import type {
  ProgrammingLanguage,
  ProgrammingLanguageCategory,
} from '@/types/programming-language'

export type NavSectionShape = {
  id: string
  title: string
  blurb: string
  items: readonly { label: string; slug?: string }[]
}

export function isNavItemBuilt(
  item: { slug?: string },
  bySlug: Record<string, Concept | undefined>,
): boolean {
  if (!item.slug) return false
  return bySlug[item.slug]?.status === 'available'
}

/** Drop nav rows without a live lesson; remove empty accordion sections. */
export function filterCurriculumSections<T extends NavSectionShape>(
  sections: readonly T[],
  bySlug: Record<string, Concept | undefined>,
  publishedOnly: boolean,
): T[] {
  if (!publishedOnly) return [...sections]
  return sections
    .map(s => ({
      ...s,
      items: s.items.filter(it => isNavItemBuilt(it, bySlug)),
    }))
    .filter(s => s.items.length > 0)
}

export function filterProgrammingLanguages(
  langs: ProgrammingLanguage[],
  bySlug: Record<string, Concept | undefined>,
  publishedOnly: boolean,
): ProgrammingLanguage[] {
  if (!publishedOnly) return langs
  return langs
    .map(lang => ({
      ...lang,
      categories: lang.categories
        .map(
          (cat: ProgrammingLanguageCategory): ProgrammingLanguageCategory => ({
            ...cat,
            items: cat.items.filter(it => isNavItemBuilt(it, bySlug)),
          }),
        )
        .filter(cat => cat.items.length > 0),
    }))
    .filter(lang => lang.categories.length > 0)
}
