import { useCallback, useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { fetchConcept } from '../api'
import { fetchLabConcept } from '@/features/labs/api'
import { useLab } from '@/contexts/lab'
import SimulationPanel, { type SimMetrics } from '@/components/SimulationPanel'
import CodePanel from '@/components/CodePanel'
import MetricsPanel from '@/components/MetricsPanel'
import DynamicCodePanel from '@/components/DynamicCodePanel'
import SingletonVisualizer from '@/components/SingletonVisualizer'
import NumericalComputingVisualizer from '@/components/NumericalComputingVisualizer'
import DesignPatternBottomPanel from '@/components/DesignPatternBottomPanel'
import DataScienceLabPanel from '@/components/DataScienceLabPanel'
import type { Concept } from '@/types/concept'
import type { LabConceptDetail } from '@/types/labConcept'
import type { NumpyFn } from '@/lib/numpyDemo'
import styles from './ConceptDetailPage.module.css'

const DEFAULT_METRICS: SimMetrics = { hits: 0, misses: 0, total: 0 }
const MIN_WIDTH = 260
const MAX_WIDTH = 680

function initialNumpyState(c: LabConceptDetail | null) {
  if (!c?.parameters?.length) {
    return { fn: 'ones' as NumpyFn, len: 8 }
  }
  const fnP = c.parameters.find(p => p.id === 'numpy_fn')
  const lenP = c.parameters.find(p => p.id === 'array_len')
  const fn = (fnP?.defaultOption ?? 'ones') as NumpyFn
  const len = lenP?.default != null ? Math.round(lenP.default) : 8
  return { fn, len }
}

export default function ConceptDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const { labId } = useLab()

  const [concept, setConcept] = useState<Concept | null>(null)
  const [labConcept, setLabConcept] = useState<LabConceptDetail | null>(null)
  const [error, setError] = useState<string | null>(null)

  const [isRunning, setRunning] = useState(false)
  const [hitRate, setHitRate] = useState(0.7)
  const [metrics, setMetrics] = useState<SimMetrics>(DEFAULT_METRICS)

  const [numpyFn, setNumpyFn] = useState<NumpyFn>('ones')
  const [arrayLen, setArrayLen] = useState(8)

  const [rightWidth, setRightWidth] = useState(400)

  useEffect(() => {
    if (!slug) return
    setError(null)
    setConcept(null)
    setLabConcept(null)

    if (labId === 'system-design') {
      fetchConcept(slug)
        .then(setConcept)
        .catch(() => setError('Concept not found.'))
      return
    }

    if (labId === 'design-patterns') {
      fetchLabConcept('design-patterns', slug)
        .then(setLabConcept)
        .catch(() => setError('Concept not found.'))
      return
    }

    if (labId === 'data-science') {
      fetchLabConcept('data-science', slug)
        .then(c => {
          setLabConcept(c)
          const init = initialNumpyState(c)
          setNumpyFn(init.fn)
          setArrayLen(init.len)
        })
        .catch(() => setError('Concept not found.'))
    }
  }, [slug, labId])

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
    const startX = e.clientX
    const startW = rightWidth

    const onMove = (ev: MouseEvent) => {
      const delta = startX - ev.clientX
      setRightWidth(Math.max(MIN_WIDTH, Math.min(MAX_WIDTH, startW + delta)))
    }
    const onUp = () => {
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

  const title =
    labId === 'system-design' ? concept?.title : labConcept?.title
  const difficulty =
    labId === 'system-design' ? concept?.difficulty : labConcept?.difficulty

  if (error) {
    return (
      <div className={styles.errorPage}>
        <p>{error}</p>
        <Link to="/" className={styles.backLink}>← Back to Library</Link>
      </div>
    )
  }

  const libraryLabel =
    labId === 'system-design'
      ? 'Concept Library'
      : labId === 'design-patterns'
        ? 'Design Patterns'
        : 'Data Science'

  /* ── System design (unchanged) ───────────────────────── */
  if (labId === 'system-design') {
    return (
      <div className={styles.page}>
        <div className={styles.pageHeader}>
          <div className={styles.breadcrumb}>
            <Link to="/" className={styles.breadcrumbLink}>{libraryLabel}</Link>
            <span className={styles.breadcrumbSep}>›</span>
            <span className={styles.breadcrumbCurrent}>{title ?? '…'}</span>
          </div>
          {concept && (
            <span className={`badge badge--${concept.difficulty}`}>{concept.difficulty}</span>
          )}
        </div>

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

          <div
            className={styles.dragHandle}
            onMouseDown={handleDragStart}
            title="Drag to resize"
          >
            <div className={styles.dragDots} />
          </div>

          <div className={styles.right}>
            <CodePanel />
          </div>
        </div>
      </div>
    )
  }

  /* ── Design patterns ─────────────────────────────────── */
  if (labId === 'design-patterns' && labConcept?.vizType === 'singleton') {
    return (
      <div className={styles.page}>
        <div className={styles.pageHeader}>
          <div className={styles.breadcrumb}>
            <Link to="/" className={styles.breadcrumbLink}>{libraryLabel}</Link>
            <span className={styles.breadcrumbSep}>›</span>
            <span className={styles.breadcrumbCurrent}>{title ?? '…'}</span>
          </div>
          {difficulty && (
            <span className={`badge badge--${difficulty}`}>{difficulty}</span>
          )}
        </div>

        <div
          className={styles.mainArea}
          style={{ gridTemplateColumns: `1fr 6px ${rightWidth}px` }}
        >
          <div className={styles.leftCol}>
            <div className={styles.center}>
              <SingletonVisualizer isRunning={isRunning} onToggleRun={handleToggleRun} />
            </div>
            <div className={styles.bottom}>
              <DesignPatternBottomPanel />
            </div>
          </div>

          <div
            className={styles.dragHandle}
            onMouseDown={handleDragStart}
            title="Drag to resize"
          >
            <div className={styles.dragDots} />
          </div>

          <div className={styles.right}>
            <DynamicCodePanel files={labConcept.codeFiles} />
          </div>
        </div>
      </div>
    )
  }

  /* ── Data science ────────────────────────────────────── */
  if (labId === 'data-science' && labConcept?.vizType === 'numerical') {
    return (
      <div className={styles.page}>
        <div className={styles.pageHeader}>
          <div className={styles.breadcrumb}>
            <Link to="/" className={styles.breadcrumbLink}>{libraryLabel}</Link>
            <span className={styles.breadcrumbSep}>›</span>
            <span className={styles.breadcrumbCurrent}>{title ?? '…'}</span>
          </div>
          {difficulty && (
            <span className={`badge badge--${difficulty}`}>{difficulty}</span>
          )}
        </div>

        <div
          className={styles.mainArea}
          style={{ gridTemplateColumns: `1fr 6px ${rightWidth}px` }}
        >
          <div className={styles.leftCol}>
            <div className={styles.center}>
              <NumericalComputingVisualizer
                numpyFn={numpyFn}
                length={arrayLen}
                isRunning={isRunning}
                onToggleRun={handleToggleRun}
              />
            </div>
            <div className={styles.bottom}>
              <DataScienceLabPanel
                parameters={labConcept.parameters ?? []}
                numpyFn={numpyFn}
                arrayLen={arrayLen}
                onNumpyFn={setNumpyFn}
                onArrayLen={setArrayLen}
              />
            </div>
          </div>

          <div
            className={styles.dragHandle}
            onMouseDown={handleDragStart}
            title="Drag to resize"
          >
            <div className={styles.dragDots} />
          </div>

          <div className={styles.right}>
            <DynamicCodePanel files={labConcept.codeFiles} />
          </div>
        </div>
      </div>
    )
  }

  if (labConcept && (labId === 'design-patterns' || labId === 'data-science')) {
    return (
      <div className={styles.errorPage}>
        <p>This lesson layout is not available yet.</p>
        <Link to="/" className={styles.backLink}>← Back to Library</Link>
      </div>
    )
  }

  return (
    <div className={styles.page}>
      <div className={styles.loadingWrap}>
        <div className={styles.spinner} />
        <span>Loading…</span>
      </div>
    </div>
  )
}
