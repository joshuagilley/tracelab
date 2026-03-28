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
  'design-patterns': {
    title: 'Design Patterns',
    subtitle:
      'How types and objects collaborate inside a program — creational, structural, and behavioral patterns in code (not datacenter layout, cloud IAM, or REST resource modeling).',
    countLabel: 'PATTERNS',
  },
  'data-science': {
    title: 'Data Science',
    subtitle:
      'How you explore, clean, and model data — arrays, statistics, and visualization in Python (not microservice meshes, API versioning, or infra provisioning).',
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
