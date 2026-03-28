import { useEffect, useState } from 'react'
import { fetchSectionConcepts } from '@/features/sections/api'
import { useLab } from '@/contexts/lab'
import ConceptCard from '../components/ConceptCard'
import type { Concept } from '@/types/concept'
import styles from './ConceptLibraryPage.module.css'

const COPY: Record<string, { title: string; subtitle: string; countLabel: string }> = {
  'system-design': {
    title: 'Concept Library',
    subtitle: 'Select a system design concept to open an interactive lesson.',
    countLabel: 'CONCEPTS',
  },
  'design-patterns': {
    title: 'Design Patterns',
    subtitle: 'Classic object-oriented patterns with code and structure diagrams.',
    countLabel: 'PATTERNS',
  },
  'data-science': {
    title: 'Data Science',
    subtitle: 'Numerical and analytical concepts — static lessons in production; Python playground via Docker.',
    countLabel: 'TOPICS',
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
