import type { CurriculumNavSection } from '@/types/curriculumNav'

/** How bytes move across the wire — complements API Design (contracts) and System Design (CDNs, DNS at scale). */
export const NETWORKING_SECTIONS: CurriculumNavSection[] = [
  {
    id: 'fundamentals',
    title: 'Foundations',
    blurb:
      'Protocols and naming that every request depends on before it hits your API or load balancer.',
    items: [
      { label: 'HTTP / HTTPS' },
      { label: 'TCP vs UDP' },
      { label: 'DNS' },
      { label: 'How requests flow (client → server)' },
    ],
  },
  {
    id: 'scaling-realtime',
    title: 'Scale & real-time',
    blurb:
      'Moving bits under load and keeping long-lived connections — pairs with System Design load balancing and API Design WebSockets.',
    items: [
      { label: 'Load balancing algorithms' },
      { label: 'WebSockets' },
    ],
  },
  {
    id: 'api-shapes',
    title: 'API shapes on the wire',
    blurb:
      'How different styles look on the network — resource modeling and versioning live in API Design; this is wires, connections, and payload shape.',
    items: [{ label: 'REST vs GraphQL (protocol-level view)' }],
  },
]

export const NETWORKING_DEFAULT_OPEN = [] as const
