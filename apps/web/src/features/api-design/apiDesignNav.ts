export interface ApiDesignNavItem {
  label: string
  slug?: string
}

export interface ApiDesignNavSection {
  id: string
  title: string
  blurb: string
  items: ApiDesignNavItem[]
}

/** Boundaries: API surface & contracts — not internal concurrency (separate track) or macro system topology (System Design). */
export const API_DESIGN_SECTIONS: ApiDesignNavSection[] = [
  {
    id: 'foundations',
    title: 'Foundations',
    blurb: 'HTTP vocabulary: resources, methods, and status codes that every API consumer relies on.',
    items: [
      { label: 'What is an API' },
      { label: 'REST Basics' },
      { label: 'HTTP Methods (GET, POST, PUT, DELETE)' },
      { label: 'Status Codes' },
    ],
  },
  {
    id: 'structure',
    title: 'API Structure',
    blurb: 'Resource modeling, URLs, payloads, and list semantics — how clients navigate your surface area.',
    items: [
      { label: 'Resource-Based Design' },
      { label: 'URL Design' },
      { label: 'Request/Response Modeling' },
      { label: 'Pagination' },
      { label: 'Filtering & Sorting' },
    ],
  },
  {
    id: 'ingress-async',
    title: 'Gateways & real-time clients',
    blurb:
      'Ingress, connection upgrades, and service-to-service callbacks — the HTTP/WebSocket layer, not message-broker topology (see System Design → messaging).',
    items: [
      { label: 'API Gateway (routing, TLS termination, auth at the edge)' },
      { label: 'Long polling and short polling' },
      { label: 'WebSockets' },
      { label: 'Event-driven APIs and callbacks between services' },
      { label: 'Error handling in event-driven and async APIs' },
    ],
  },
  {
    id: 'performance',
    title: 'Performance & Scalability',
    blurb:
      'Protecting backends and shaping traffic at the HTTP boundary (429s, quotas, cache headers). In-process token buckets, semaphores, and worker-pool throttling live under Concurrency.',
    items: [
      { label: 'Rate Limiting (HTTP & client quotas)', slug: 'rate-limiting' },
      { label: 'Caching APIs' },
      { label: 'Idempotency' },
      { label: 'Batch vs Single Requests (API contract)' },
    ],
  },
  {
    id: 'reliability',
    title: 'Reliability',
    blurb: 'How clients and gateways behave when the network or dependencies misbehave.',
    items: [
      { label: 'Retries', slug: 'retries' },
      { label: 'Timeouts' },
      { label: 'Circuit Breakers', slug: 'circuit-breaker' },
      { label: 'Error Handling Patterns' },
    ],
  },
  {
    id: 'security',
    title: 'Security',
    blurb:
      'Identity, authorization, and validating untrusted input at the API edge — XSS, SQL injection, crypto, and secrets depth live under Security.',
    items: [
      { label: 'Authentication (API Keys, JWT)' },
      { label: 'Authorization' },
      { label: 'OAuth Basics' },
      { label: 'Input Validation' },
    ],
  },
  {
    id: 'advanced',
    title: 'Advanced',
    blurb: 'Versioning, alternate RPC styles, and outbound hooks — still the contract layer, not broker internals.',
    items: [
      { label: 'API Versioning' },
      { label: 'GraphQL vs REST' },
      { label: 'Webhooks' },
      { label: 'gRPC' },
    ],
  },
]
