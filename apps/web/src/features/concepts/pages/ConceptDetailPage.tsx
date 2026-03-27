import { useCallback, useEffect, useRef, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { fetchConcept } from '../api'
import SimulationPanel, { type SimMetrics } from '@/components/SimulationPanel'
import CodePanel from '@/components/CodePanel'
import MetricsPanel from '@/components/MetricsPanel'
import type { Concept } from '@/types/concept'
import styles from './ConceptDetailPage.module.css'

const DEFAULT_METRICS: SimMetrics = { hits: 0, misses: 0, total: 0 }
const MIN_WIDTH = 260
const MAX_WIDTH = 680

export default function ConceptDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const [concept, setConcept]   = useState<Concept | null>(null)
  const [error, setError]       = useState<string | null>(null)
  const [isRunning, setRunning] = useState(false)
  const [hitRate, setHitRate]   = useState(0.7)
  const [metrics, setMetrics]   = useState<SimMetrics>(DEFAULT_METRICS)
  const [rightWidth, setRightWidth] = useState(400)
  const isDragging = useRef(false)

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

  const handleDragStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    isDragging.current = true
    const startX = e.clientX
    const startW = rightWidth

    const onMove = (ev: MouseEvent) => {
      const delta = startX - ev.clientX  // drag left → wider
      setRightWidth(Math.max(MIN_WIDTH, Math.min(MAX_WIDTH, startW + delta)))
    }
    const onUp = () => {
      isDragging.current = false
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseup', onUp)
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }

    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'
    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseup', onUp)
  }, [rightWidth])

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

      {/* ── Breadcrumb ────────────────────────────── */}
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

      {/* ── 3-col: left | drag-handle | right (code) ── */}
      <div
        className={styles.mainArea}
        style={{ gridTemplateColumns: `1fr 6px ${rightWidth}px` }}
      >
        <div className={styles.leftCol}>
          <div className={styles.center}>
            <SimulationPanel
              isRunning={isRunning}
              hitRate={hitRate}
              onMetrics={setMetrics}
              onToggleRun={handleToggleRun}
            />
          </div>
          <div className={styles.bottom}>
            <MetricsPanel
              isRunning={isRunning}
              metrics={metrics}
              hitRate={hitRate}
              onHitRateChange={setHitRate}
            />
          </div>
        </div>

        {/* Drag handle */}
        <div
          className={styles.dragHandle}
          onMouseDown={handleDragStart}
          title="Drag to resize"
        >
          <div className={styles.dragDots} />
        </div>

        {/* Code panel: full height */}
        <div className={styles.right}>
          <CodePanel />
        </div>

      </div>

    </div>
  )
}
