import { useEffect, useState } from 'react'
import { fetchSectionConcepts } from '@/features/sections/api'
import { useLab, type LabId } from '@/contexts/lab'
import ConceptCard from '../components/ConceptCard'
import type { Concept } from '@/types/concept'
import styles from './ConceptLibraryPage.module.css'

const COPY: Record<
  LabId,
  { title: string; subtitle: string; countLabel: string }
> = {
  'system-design': {
    title: 'System Design',
    subtitle:
      'How multiple services and data stores connect and scale together — load balancers, durable queues, caching, and failure domains (not the HTTP contract of a single service, and not goroutine-level execution; see Concurrency).',
    countLabel: 'CONCEPTS',
  },
  'api-design': {
    title: 'API Design',
    subtitle:
      'How one service exposes functionality to callers — endpoints, contracts, HTTP rate limits, and resilience at the boundary (not cross-service topology; in-process pools and locks live under Concurrency).',
    countLabel: 'TOPICS',
  },
  concurrency: {
    title: 'Concurrency',
    subtitle:
      'Parallel execution, coordination, and shared state inside one service — goroutines, channels, locks, and pools (the layer between `go processJob()` in a handler and macro-scale queues in System Design).',
    countLabel: 'TOPICS',
  },
  networking: {
    title: 'Networking',
    subtitle:
      'How data moves across the wire — DNS, TCP/HTTP, TLS, and connection behavior that sits under APIs, CDNs, and load balancers (resource modeling stays in API Design; global topology in System Design).',
    countLabel: 'TOPICS',
  },
  security: {
    title: 'Security',
    subtitle:
      'Protecting users, data, and access paths — authn/z, common web attacks, crypto basics, and secrets (HTTP JWT/OAuth details also touch API Design; cloud IAM/KMS in Cloud Architecture).',
    countLabel: 'TOPICS',
  },
  'software-architecture': {
    title: 'Software Architecture',
    subtitle:
      'How you structure code inside a system — layers, modules, ports/adapters, and domain modeling (small OO patterns live under Design Patterns; deployment workflows under DevOps).',
    countLabel: 'TOPICS',
  },
  testing: {
    title: 'Testing',
    subtitle:
      'Making behavior provable — units, integration, mocks, testable design, and E2E checks (distributed soak/CI-at-scale overlaps System Design at the edges).',
    countLabel: 'TOPICS',
  },
  devops: {
    title: 'DevOps',
    subtitle:
      'How software is built, shipped, and operated — CI/CD, git discipline, containers, orchestration, and safe releases (managed VPC/Lambda building blocks stay in Cloud Architecture).',
    countLabel: 'TOPICS',
  },
  'low-level-systems': {
    title: 'Low-Level Systems',
    subtitle:
      'What your code is really doing — memory, pointers, the CPU, syscalls, and the OS in C (`present.c` / `bad.c`), with almost no runtime magic. Goroutines and channels stay under Concurrency; distributed design under System Design.',
    countLabel: 'TOPICS',
  },
  algorithms: {
    title: 'Algorithms & Data Structures',
    subtitle:
      'Complexity, core collections, and classic structures — the language of performance before you tune Concurrency or shard databases.',
    countLabel: 'TOPICS',
  },
  'ai-systems': {
    title: 'AI Systems',
    subtitle:
      'Machine learning, deep learning, embeddings, vector search, RAG, and model serving — exploratory analysis, SQL, and viz stay under Data Science.',
    countLabel: 'TOPICS',
  },
  'programming-languages': {
    title: 'Programming Languages',
    subtitle:
      'Language-specific mental models — how each language executes, types data, and fits in real systems (not syntax drills; concurrency depth stays under Concurrency, memory detail under Low-Level Systems).',
    countLabel: 'TOPICS',
  },
  'design-patterns': {
    title: 'Design Patterns',
    subtitle:
      'How types and objects collaborate inside a program — creational, structural, and behavioral patterns in code (not datacenter layout, cloud IAM, or REST resource modeling).',
    countLabel: 'PATTERNS',
  },
  'data-science': {
    title: 'Data Science',
    subtitle:
      'How you explore, clean, and communicate data — Python, SQL, statistics, visualization, and BI (training models and neural nets live under AI Systems, not here).',
    countLabel: 'TOPICS',
  },
  'database-design': {
    title: 'Database Design',
    subtitle:
      'How data is shaped, constrained, and accessed in storage — schemas, keys, indexes, replication, and scaling the database (not VPC routing, HTTP handlers, or goroutine pools).',
    countLabel: 'LESSONS',
  },
  'cloud-architecture': {
    title: 'Cloud Architecture',
    subtitle:
      'How workloads run on provider-managed building blocks — networks, compute, object storage, IAM, and observability in the cloud (not SQL normalization, OO patterns, or pandas workflows).',
    countLabel: 'LESSONS',
  },
}

export default function ConceptLibraryPage() {
  const { labId } = useLab()
  const [concepts, setConcepts] = useState<Concept[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const { title, subtitle, countLabel } = COPY[labId] ?? COPY['system-design']

  useEffect(() => {
    setLoading(true)
    setError(null)

    const run = async () => {
      try {
        setConcepts(await fetchSectionConcepts(labId))
      } catch {
        setError('Could not reach the TraceLab API. Is the Go server running?')
        setConcepts([])
      } finally {
        setLoading(false)
      }
    }

    run()
  }, [labId])

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>{title}</h1>
          <p className={styles.subtitle}>{subtitle}</p>
        </div>
        <div className={styles.statusBadge}>
          <span className={`dot ${!loading && !error ? 'live' : ''}`} />
          <span className="panel-label">
            {loading ? 'LOADING…' : error ? 'API OFFLINE' : `${concepts.length} ${countLabel}`}
          </span>
        </div>
      </div>

      {error && (
        <div className={styles.errorBox}>
          <span>⚠</span> {error}
        </div>
      )}

      {!loading && !error && (
        <div className={styles.grid}>
          {concepts.map(c => (
            <ConceptCard key={c.id} concept={c} />
          ))}
        </div>
      )}

      {loading && (
        <div className={styles.loading}>
          <div className={styles.spinner} />
          <span>Fetching concepts…</span>
        </div>
      )}
    </div>
  )
}
