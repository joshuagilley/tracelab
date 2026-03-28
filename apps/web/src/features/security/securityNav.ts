import type { CurriculumNavSection } from '@/types/curriculumNav'

/** Protecting data, identities, and workloads — ties to API Design (auth, OAuth) and Cloud Architecture (IAM, KMS). */
export const SECURITY_SECTIONS: CurriculumNavSection[] = [
  {
    id: 'identity-access',
    title: 'Identity & access',
    blurb:
      'Who is calling and what they may do — JWT/OAuth as used by HTTP APIs are summarized in API Design; this track is the full identity story.',
    items: [
      { label: 'Authentication vs Authorization' },
      { label: 'JWT & Sessions' },
      { label: 'OAuth' },
    ],
  },
  {
    id: 'application',
    title: 'Application security',
    blurb: 'Common abuse patterns against services and browsers — complements input validation in API Design.',
    items: [
      { label: 'API Security' },
      { label: 'SQL Injection' },
      { label: 'XSS / CSRF' },
    ],
  },
  {
    id: 'data-ops',
    title: 'Data & operations',
    blurb: 'Protecting data at rest and in config — secret sprawl is a cloud and CI/CD problem too.',
    items: [
      { label: 'Encryption basics' },
      { label: 'Secrets management' },
    ],
  },
]

export const SECURITY_DEFAULT_OPEN = ['identity-access', 'application'] as const
