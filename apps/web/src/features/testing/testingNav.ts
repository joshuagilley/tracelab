import type { CurriculumNavSection } from '@/types/curriculumNav'

/** Confidence at each layer — from fast unit checks to full-path verification (System Design covers soak/E2E at distributed scale). */
export const TESTING_SECTIONS: CurriculumNavSection[] = [
  {
    id: 'foundations',
    title: 'Foundations',
    blurb: 'Fast feedback loops and isolating units — the default toolkit for backend and API services.',
    items: [
      { label: 'Unit testing' },
      { label: 'Integration testing' },
      { label: 'Mocking' },
    ],
  },
  {
    id: 'beyond-happy-path',
    title: 'Beyond the happy path',
    blurb: 'Designing for testability and validating real user journeys end-to-end.',
    items: [
      { label: 'Testable design' },
      { label: 'End-to-end testing' },
    ],
  },
]

export const TESTING_DEFAULT_OPEN = [] as const
