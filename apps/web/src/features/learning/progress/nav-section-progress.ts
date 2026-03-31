import type { Concept } from '@/types/concept'

export interface NavSlugItem {
  label: string
  slug?: string
}

/** Count available lesson rows in a section and how many are marked concept-done. */
export function countSectionNavProgress(
  items: NavSlugItem[],
  bySlug: Record<string, Concept | undefined>,
  completedSlugs?: ReadonlySet<string>,
): { done: number; total: number } {
  let total = 0
  let done = 0
  for (const item of items) {
    if (!item.slug) continue
    const c = bySlug[item.slug]
    if (c?.status !== 'available') continue
    total += 1
    if (completedSlugs?.has(item.slug)) done += 1
  }
  return { done, total }
}
