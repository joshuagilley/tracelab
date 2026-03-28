import type { CurriculumNavSection } from '@/types/curriculumNav'

/** Reasoning about cost and core structures — supports performance work in Concurrency and System Design without replacing LeetCode depth. */
export const ALGORITHMS_SECTIONS: CurriculumNavSection[] = [
  {
    id: 'foundations',
    title: 'Foundations',
    blurb: 'Complexity vocabulary and the collections you reach for in every language.',
    items: [
      { label: 'Big-O complexity' },
      { label: 'Arrays, maps, sets' },
      { label: 'Sorting / searching' },
    ],
  },
  {
    id: 'structures',
    title: 'Structures',
    blurb: 'Hierarchical and linked data — the basis for many system internals (indexes, routing, graphs).',
    items: [{ label: 'Trees, graphs' }],
  },
]

export const ALGORITHMS_DEFAULT_OPEN = [] as const
