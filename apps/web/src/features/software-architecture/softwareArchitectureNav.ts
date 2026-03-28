import type { CurriculumNavSection } from '@/types/curriculumNav'

/** Structuring code inside a system — boundaries, modules, and domain language (not OO micro-patterns; see Design Patterns). */
export const SOFTWARE_ARCHITECTURE_SECTIONS: CurriculumNavSection[] = [
  {
    id: 'structure',
    title: 'Structure',
    blurb: 'Classic layering and composition — Dependency Injection also appears as a pattern under Design Patterns.',
    items: [
      { label: 'Layered architecture' },
      { label: 'Modular design' },
      { label: 'Dependency Injection' },
    ],
  },
  {
    id: 'ports-boundaries',
    title: 'Ports & boundaries',
    blurb: 'Isolating domain logic from IO and frameworks so tests and adapters can swap cleanly.',
    items: [
      { label: 'Hexagonal architecture' },
      { label: 'Clean architecture' },
    ],
  },
  {
    id: 'domain',
    title: 'Domain modeling',
    blurb: 'Aligning code with business language and invariants — the heavy lift of large systems.',
    items: [{ label: 'Domain-Driven Design' }],
  },
]

export const SOFTWARE_ARCHITECTURE_DEFAULT_OPEN = [] as const
