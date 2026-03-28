export interface SystemDesignNavItem {
  label: string
  /** API slug when a lesson exists in system-design.json */
  slug?: string
}

export interface SystemDesignNavSection {
  id: string
  title: string
  blurb: string
  items: SystemDesignNavItem[]
}

export const SYSTEM_DESIGN_SECTIONS: SystemDesignNavSection[] = [
  {
    id: 'hld',
    title: 'High Level Design',
    blurb: 'Focuses on system architecture, components, and their interactions.',
    items: [
      { label: 'Introduction to High Level Design' },
      { label: 'High Level Design Diagram' },
    ],
  },
  {
    id: 'architectural-styles',
    title: 'System Architectural Styles',
    blurb: 'Common architectural patterns used in system design.',
    items: [
      { label: 'Monolithic Architecture' },
      { label: 'Microservices' },
      { label: 'Monolithic Vs Microservices Architecture' },
      { label: 'Event-Driven Architecture' },
      { label: 'Serverless Architecture' },
      { label: 'Stateful Vs Stateless Architecture' },
      { label: 'Pub/Sub Architecture', slug: 'pub-sub' },
    ],
  },
  {
    id: 'scalability',
    title: 'Scalability',
    blurb: 'Concepts and strategies for growing applications.',
    items: [
      { label: 'Scalability in System Design' },
      { label: 'Horizontal and Vertical Scaling' },
      { label: 'Right Scalability approach for our Application' },
      { label: 'Designing Highly Scalable Systems' },
      { label: 'Primary Bottlenecks that Hurt the Scalability of an Application' },
    ],
  },
  {
    id: 'databases',
    title: 'Databases in Designing Systems',
    blurb: 'Databases, storage systems, and how they are used in system design.',
    items: [
      { label: 'Designing the Database' },
      { label: 'Types of Database' },
      { label: 'Choosing a Database - SQL or NoSQL' },
      { label: 'File and Database Storage Systems' },
      { label: 'Database Replication in System Design' },
      { label: 'Database Sharding', slug: 'sharding' },
      { label: 'Block, Object, and File Storage' },
      { label: 'Normalization Process in DBMS' },
      { label: 'SQL Query Optimization' },
      { label: 'Denormalization in Databases' },
      { label: 'Intro to Redis' },
    ],
  },
  {
    id: 'carm',
    title: 'Consistency, Availability, Reliability & Maintainability',
    blurb: 'Core system qualities that impact user experience and system health.',
    items: [
      { label: 'Availability in System Design' },
      { label: 'Achieving High Availability' },
      { label: 'Consistency in System Design' },
      { label: 'Consistency pattern' },
      { label: 'CAP Theorem' },
      { label: 'Reliability in System Design' },
      { label: 'Fault Tolerance in System Design' },
      { label: 'Maintainability' },
    ],
  },
  {
    id: 'load-balancing',
    title: 'Load Balancing',
    blurb:
      'Traffic distribution across instances and regions. CPU threads, goroutines, and in-process parallelism belong under Concurrency.',
    items: [
      { label: 'Load Balancer', slug: 'load-balancing' },
      { label: 'Load Balancing Algorithms', slug: 'load-balancing' },
      { label: 'Stateless Vs Stateful Load Balancing' },
      { label: 'Load Balancing vs. Failover' },
      { label: 'Consistent Hashing' },
    ],
  },
  {
    id: 'latency-caching',
    title: 'Latency, Throughput and Caching',
    blurb:
      'System-wide SLOs, edge caching, and pipeline throughput. Per-service worker saturation and lock contention are covered under Concurrency.',
    items: [
      { label: 'Latency and Throughput' },
      { label: 'Caching in System Design', slug: 'caching' },
      { label: 'Design Distributed Cache' },
      { label: 'Edge Caching' },
      { label: 'Cache Eviction Policies' },
      { label: 'Cold and Warm Cache in System Design' },
    ],
  },
  {
    id: 'messaging',
    title: 'Message Queues & Async Handoffs',
    blurb:
      'Durable buffers and pub/sub between services — decoupling producers from consumers. HTTP ingress, gateways, and real-time client APIs live under API Design.',
    items: [{ label: 'Message Queues', slug: 'queues' }],
  },
  {
    id: 'protocols',
    title: 'Protocols, CDN & Proxies',
    blurb:
      'L3–L7 plumbing, DNS, and edge caching for systems. Client-facing long-poll, WebSocket, and gateway routing patterns are covered under API Design.',
    items: [
      { label: 'Communication Protocols' },
      { label: 'Domain Name System' },
      { label: 'DNS Caching' },
      { label: 'Time to Live(TTL)' },
      { label: 'Content Delivery Network(CDN)' },
      { label: 'Proxies in System Design' },
      { label: 'Forward Proxy vs Reverse Proxy' },
    ],
  },
  {
    id: 'event-driven-advanced',
    title: 'Event-Driven Architecture',
    blurb:
      'Explains event-driven concepts, patterns, and comparisons commonly discussed in system design interviews.',
    items: [
      { label: 'Introduction' },
      { label: 'Event Sourcing Pattern' },
      { label: 'Event Sourcing Vs Event Streaming' },
      {
        label:
          'Restore State in an Event-Based, Message-Driven Microservice Architecture on Failure Scenario',
      },
      { label: 'Event-Driven Architecture Patterns in Cloud Native Applications' },
      { label: 'Request-driven Vs Event-driven Microservices' },
      { label: 'Event-Driven Architecture Vs Microservices Architecture' },
      { label: 'Event-Driven Architecture Vs Data-Driven Architecture' },
      { label: 'Message-Driven Architecture Vs Event-Driven Architecture' },
    ],
  },
  {
    id: 'testing',
    title: 'Testing at System Scale',
    blurb:
      'Validating a distributed system end-to-end. Unit and typical integration tests are general engineering; contract and consumer tests for HTTP APIs live under API Design.',
    items: [
      { label: 'End-to-End & Soak Testing' },
      { label: 'CI/CD for Distributed Systems' },
    ],
  },
  {
    id: 'security',
    title: 'Security Measures',
    blurb:
      'Platform-wide posture: encryption in transit, SDLC, and recovery. API keys, JWT, OAuth, and request authorization models are under API Design.',
    items: [
      { label: 'Security Measures in System Design' },
      { label: 'Secure Socket Layer (SSL) and Transport Layer Security (TLS)' },
      { label: 'Secure Software Development Life Cycle (SSDLC)' },
      { label: 'Data Backup and Disaster Recovery' },
    ],
  },
  {
    id: 'distributed',
    title: 'Distributed System Design',
    blurb:
      'Explains consensus algorithms, tracing, and security considerations in distributed system design.',
    items: [
      { label: 'Introduction' },
      { label: 'Consensus Algorithms in Distributed System' },
      { label: 'Distributed Tracing' },
      { label: 'Secure Communication in Distributed System' },
      { label: 'Design Issues of Distributed System' },
    ],
  },
  {
    id: 'cost-performance',
    title: 'Cost & Performance Optimizations',
    blurb: 'Explains how to optimize system performance and estimate software costs effectively.',
    items: [
      { label: 'Software Cost Estimation' },
      { label: 'Performance Optimization Techniques' },
      { label: 'Cost Vs Performance' },
    ],
  },
]
