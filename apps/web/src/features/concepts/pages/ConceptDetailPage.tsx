import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { fetchConcept } from '../api'
import SimulationPanel, { type SimMetrics } from '@/components/SimulationPanel'
import CodePanel from '@/components/CodePanel'
import MetricsPanel from '@/components/MetricsPanel'
import type { Concept } from '@/types/concept'
import styles from './ConceptDetailPage.module.css'

const DEFAULT_METRICS: SimMetrics = { hits: 0, misses: 0, total: 0 }

export default function ConceptDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const [concept, setConcept]   = useState<Concept | null>(null)
  const [error, setError]       = useState<string | null>(null)
  const [isRunning, setRunning] = useState(false)
  const [hitRate, setHitRate]   = useState(0.7)
  const [metrics, setMetrics]   = useState<SimMetrics>(DEFAULT_METRICS)

  useEffect(() => {
    if (!slug) return
    fetchConcept(slug)
      .then(setConcept)
      .catch(() => setError('Concept not found.'))
  }, [slug])

  const handleToggleRun = () => {
    if (isRunning) {
      setRunning(false)
      setMetrics(DEFAULT_METRICS)
    } else {
      setRunning(true)
    }
  }

  if (error) {
    return (
      <div className={styles.errorPage}>
        <p>{error}</p>
        <Link to="/" className={styles.backLink}>← Back to Library</Link>
      </div>
    )
  }

  return (
    <div className={styles.page}>
      {/* ── Page header ───────────────────────────── */}
      <div className={styles.pageHeader}>
        <div className={styles.breadcrumb}>
          <Link to="/" className={styles.breadcrumbLink}>Concept Library</Link>
          <span className={styles.breadcrumbSep}>›</span>
          <span className={styles.breadcrumbCurrent}>{concept?.title ?? '…'}</span>
        </div>
        {concept && (
          <span className={`badge badge--${concept.difficulty}`}>{concept.difficulty}</span>
        )}
      </div>

      {/* ── 2-col layout: content + right panel ────── */}
      <div className={styles.layout}>

        {/* Center: visualizer + code */}
        <div className={styles.center}>
          <SimulationPanel
            isRunning={isRunning}
            hitRate={hitRate}
            onMetrics={setMetrics}
          />
          <CodePanel />
        </div>

        {/* Right: metrics + controls */}
        <div className={styles.right}>
          <MetricsPanel
            isRunning={isRunning}
            metrics={metrics}
            hitRate={hitRate}
            onHitRateChange={setHitRate}
            onToggleRun={handleToggleRun}
          />
        </div>

      </div>
    </div>
  )
}
