import { useEffect, useState } from 'react'
import { fetchConcepts } from '../api'
import ConceptCard from '../components/ConceptCard'
import type { Concept } from '@/types/concept'
import styles from './ConceptLibraryPage.module.css'

export default function ConceptLibraryPage() {
  const [concepts, setConcepts] = useState<Concept[]>([])
  const [error, setError]       = useState<string | null>(null)
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    fetchConcepts()
      .then(setConcepts)
      .catch(() => setError('Could not reach the TraceLab API. Is the Go server running?'))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Concept Library</h1>
          <p className={styles.subtitle}>
            Select a system design concept to open an interactive lesson.
          </p>
        </div>
        <div className={styles.statusBadge}>
          <span className={`dot ${!loading && !error ? 'live' : ''}`} />
          <span className="panel-label">{loading ? 'LOADING…' : error ? 'API OFFLINE' : `${concepts.length} CONCEPTS`}</span>
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
