import { useCallback, useEffect, useMemo, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { fetchConcept } from '../api'
import { fetchLabConcept } from '@/features/labs/api'
import { useLab } from '@/contexts/lab'
import SimulationPanel, { type SimMetrics } from '@/components/SimulationPanel'
import CodePanel from '@/components/CodePanel'
import MetricsPanel from '@/components/MetricsPanel'
import DynamicCodePanel from '@/components/DynamicCodePanel'
import SingletonVisualizer, { type SingletonStats } from '@/components/SingletonVisualizer'
import DependencyInjectionVisualizer, {
  type DIStats,
  type StorageBackend,
} from '@/components/DependencyInjectionVisualizer'
import NumericalComputingVisualizer from '@/components/NumericalComputingVisualizer'
import SingletonPatternPanel from '@/components/SingletonPatternPanel'
import DependencyInjectionPatternPanel from '@/components/DependencyInjectionPatternPanel'
import DependencyInjectionCodePanel from '@/components/DependencyInjectionCodePanel'
import DataScienceLabPanel from '@/components/DataScienceLabPanel'
import type { Concept } from '@/types/concept'
import type { LabConceptDetail } from '@/types/labConcept'
import type { NumpyFn } from '@/lib/numpyDemo'
import styles from './ConceptDetailPage.module.css'

const DEFAULT_METRICS: SimMetrics = { hits: 0, misses: 0, total: 0 }
const DEFAULT_SINGLETON_STATS: SingletonStats = {
  getInstanceCalls: 0,
  initRuns: 0,
  fastPathReturns: 0,
}
const DEFAULT_DI_STATS: DIStats = { uploadsCompleted: 0, putCalls: 0, wires: 0 }
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

  const [singletonHandlers, setSingletonHandlers] = useState(3)
  const [singletonSpawn, setSingletonSpawn] = useState(450)
  const [singletonStress, setSingletonStress] = useState(false)
  const [singletonEmphasize, setSingletonEmphasize] = useState(true)
  const [singletonStats, setSingletonStats] = useState<SingletonStats>(DEFAULT_SINGLETON_STATS)

  const [diHandlers, setDiHandlers] = useState(3)
  const [diSpawn, setDiSpawn] = useState(450)
  const [diStress, setDiStress] = useState(false)
  const [diStorageBackend, setDiStorageBackend] = useState<StorageBackend>('sftp')
  const [diEmphasizeIface, setDiEmphasizeIface] = useState(true)
  const [diStats, setDiStats] = useState<DIStats>(DEFAULT_DI_STATS)

  const [rightWidth, setRightWidth] = useState(400)

  const onSingletonStats = useCallback((s: SingletonStats) => {
    setSingletonStats(s)
  }, [])

  const onDIStats = useCallback((s: DIStats) => {
    setDiStats(s)
  }, [])

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
      if (labId === 'system-design') setMetrics(DEFAULT_METRICS)
    } else {
      setRunning(true)
    }
  }

  const handleDragStart = useCallback(
    (e: React.MouseEvent) => {
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
    },
    [rightWidth],
  )

  const title = useMemo(
    () => (labId === 'system-design' ? concept?.title : labConcept?.title),
    [labId, concept?.title, labConcept?.title],
  )
  const difficulty = useMemo(
    () => (labId === 'system-design' ? concept?.difficulty : labConcept?.difficulty),
    [labId, concept?.difficulty, labConcept?.difficulty],
  )

  if (error) {
    return (
      <div className={styles.errorPage}>
        <p>{error}</p>
        <Link to="/" className={styles.backLink}>
          ← Back to library
        </Link>
      </div>
    )
  }

  const libraryLabel =
    labId === 'system-design'
      ? 'Concept Library'
      : labId === 'design-patterns'
        ? 'Design Patterns'
        : 'Data Science'

  if (labId === 'system-design') {
    return (
      <div className={styles.page}>
        <div className={styles.pageHeader}>
          <div className={styles.breadcrumb}>
            <Link to="/" className={styles.breadcrumbLink}>
              {libraryLabel}
            </Link>
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

  if (labId === 'design-patterns' && labConcept?.vizType === 'singleton') {
    return (
      <div className={styles.page}>
        <div className={styles.pageHeader}>
          <div className={styles.breadcrumb}>
            <Link to="/" className={styles.breadcrumbLink}>
              {libraryLabel}
            </Link>
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
              <SingletonVisualizer
                isRunning={isRunning}
                onToggleRun={handleToggleRun}
                handlerCount={singletonHandlers}
                spawnIntervalMs={singletonSpawn}
                stressMode={singletonStress}
                emphasizeOnce={singletonEmphasize}
                onStatsChange={onSingletonStats}
              />
            </div>
            <div className={styles.bottom}>
              <SingletonPatternPanel
                handlerCount={singletonHandlers}
                spawnIntervalMs={singletonSpawn}
                stressMode={singletonStress}
                emphasizeOnce={singletonEmphasize}
                stats={singletonStats}
                onHandlerCount={setSingletonHandlers}
                onSpawnInterval={setSingletonSpawn}
                onStressMode={setSingletonStress}
                onEmphasizeOnce={setSingletonEmphasize}
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

  if (labId === 'design-patterns' && labConcept?.vizType === 'dependency-injection') {
    return (
      <div className={styles.page}>
        <div className={styles.pageHeader}>
          <div className={styles.breadcrumb}>
            <Link to="/" className={styles.breadcrumbLink}>
              {libraryLabel}
            </Link>
            <span className={styles.breadcrumbSep}>›</span>
            <span className={styles.breadcrumbCurrent}>{title ?? '…'}</span>
          </div>
          {difficulty && (
            <span className={`badge badge--${difficulty}`}>{difficulty}</span>
          )}
        </div>

        <div
          className={styles.mainArea}
          style={{ gridTemplateColumns: `1fr 3px ${rightWidth}px` }}
        >
          <div className={styles.leftCol}>
            <div className={`${styles.center} ${styles.centerGrow}`}>
              <DependencyInjectionVisualizer
                isRunning={isRunning}
                onToggleRun={handleToggleRun}
                handlerCount={diHandlers}
                spawnIntervalMs={diSpawn}
                stressMode={diStress}
                storageBackend={diStorageBackend}
                emphasizeIface={diEmphasizeIface}
                onStatsChange={onDIStats}
              />
            </div>
            <div className={`${styles.bottom} ${styles.bottomLabPanel}`}>
              <DependencyInjectionPatternPanel
                handlerCount={diHandlers}
                spawnIntervalMs={diSpawn}
                stressMode={diStress}
                storageBackend={diStorageBackend}
                emphasizeIface={diEmphasizeIface}
                stats={diStats}
                onHandlerCount={setDiHandlers}
                onSpawnInterval={setDiSpawn}
                onStressMode={setDiStress}
                onStorageBackend={setDiStorageBackend}
                onEmphasizeIface={setDiEmphasizeIface}
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
            <DependencyInjectionCodePanel files={labConcept.codeFiles} />
          </div>
        </div>
      </div>
    )
  }

  if (labId === 'data-science' && labConcept?.vizType === 'numerical') {
    return (
      <div className={styles.page}>
        <div className={styles.pageHeader}>
          <div className={styles.breadcrumb}>
            <Link to="/" className={styles.breadcrumbLink}>
              {libraryLabel}
            </Link>
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
        <Link to="/" className={styles.backLink}>
          ← Back to library
        </Link>
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
