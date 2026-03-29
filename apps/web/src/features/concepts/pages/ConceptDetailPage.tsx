import {
  useCallback,
  useEffect,
  useState,
  type MouseEvent as ReactMouseEvent,
  type ReactNode,
} from 'react'
import { useParams, Link, useSearchParams } from 'react-router-dom'
import { fetchSectionLesson } from '@/features/sections/api'
import { LAB_OPTIONS, useLab, type LabId } from '@/contexts/lab'
import SimulationPanel, { type SimMetrics } from '@/components/system-design/latency-caching/caching/SimulationPanel'
import MetricsPanel from '@/components/system-design/latency-caching/caching/MetricsPanel'
import DynamicCodePanel from '@/components/code/DynamicCodePanel'
import CachingPracticeDownload from '@/components/system-design/latency-caching/caching/CachingPracticeDownload'
import SingletonVisualizer, { type SingletonStats } from '@/components/design-patterns/creational/singleton/SingletonVisualizer'
import DependencyInjectionVisualizer, {
  type DIStats,
  type StorageBackend,
} from '@/components/design-patterns/advanced/dependency-injection/DependencyInjectionVisualizer'
import NumericalComputingVisualizer from '@/components/data-science/numerical-computing/numerical-computing/NumericalComputingVisualizer'
import SingletonPatternPanel from '@/components/design-patterns/creational/singleton/SingletonPatternPanel'
import DependencyInjectionPatternPanel from '@/components/design-patterns/advanced/dependency-injection/DependencyInjectionPatternPanel'
import DependencyInjectionCodePanel from '@/components/design-patterns/advanced/dependency-injection/DependencyInjectionCodePanel'
import DataScienceLabPanel from '@/components/data-science/numerical-computing/numerical-computing/DataScienceLabPanel'
import DatabaseDesignLessonPanel from '@/components/database-design/DatabaseDesignLessonPanel'
import CloudArchitectureLessonPanel from '@/components/cloud-architecture/CloudArchitectureLessonPanel'
import ApiDesignLessonPanel from '@/components/api-design/ApiDesignLessonPanel'
import LowLevelSystemsLessonPanel from '@/components/low-level-systems/LowLevelSystemsLessonPanel'
import type { LabConceptDetail } from '@/types/labConcept'
import type { NumpyFn } from '@/lib/numpyDemo'
import { ConceptProgressProvider } from '@/contexts/conceptProgress'
import ConceptLessonLayout from '@/components/lesson-panels/ConceptLessonLayout'
import styles from './ConceptDetailPage.module.css'

function WithProgress({
  labId,
  slug,
  children,
}: {
  labId: LabId
  slug: string | undefined
  children: ReactNode
}) {
  if (!slug) return <>{children}</>
  return (
    <ConceptProgressProvider labId={labId} conceptSlug={slug}>
      {children}
    </ConceptProgressProvider>
  )
}

const DEFAULT_METRICS: SimMetrics = { hits: 0, misses: 0, total: 0 }
const DEFAULT_SINGLETON_STATS: SingletonStats = {
  getInstanceCalls: 0,
  initRuns: 0,
  fastPathReturns: 0,
}
const DEFAULT_DI_STATS: DIStats = { uploadsCompleted: 0, putCalls: 0, wires: 0 }
const MIN_WIDTH = 260
const MAX_WIDTH = 680

const VALID_LAB_IDS = new Set<LabId>(LAB_OPTIONS.map(o => o.id))

const LIBRARY_LABELS: Record<LabId, string> = {
  'system-design': 'Concept Library',
  'api-design': 'API Design',
  concurrency: 'Concurrency',
  networking: 'Networking',
  security: 'Security',
  'software-architecture': 'Software Architecture',
  testing: 'Testing',
  devops: 'DevOps',
  'low-level-systems': 'Low-Level Systems',
  'operating-systems': 'Operating Systems',
  algorithms: 'Algorithms & Data Structures',
  'ai-systems': 'AI Systems',
  'programming-languages': 'Programming Languages',
  'design-patterns': 'Design Patterns',
  'data-science': 'Data Science',
  'database-design': 'Database Design',
  'cloud-architecture': 'Cloud Architecture',
}

/** Lesson detail layouts not implemented yet for these tracks */
const LABS_AWAITING_LESSON_UI: readonly LabId[] = [
  'design-patterns',
  'data-science',
  'database-design',
  'cloud-architecture',
  'api-design',
  'concurrency',
  'networking',
  'security',
  'software-architecture',
  'testing',
  'devops',
  'operating-systems',
  'algorithms',
  'ai-systems',
  'programming-languages',
]

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
  const [searchParams] = useSearchParams()
  const { labId, setLabId } = useLab()
  const labQuery = searchParams.get('lab')

  useEffect(() => {
    if (!labQuery || !VALID_LAB_IDS.has(labQuery as LabId)) return
    setLabId(labQuery as LabId)
  }, [labQuery, setLabId])

  const [lesson, setLesson] = useState<LabConceptDetail | null>(null)
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
    setLesson(null)

    fetchSectionLesson(labId, slug)
      .then(c => {
        setLesson(c)
        if (labId === 'data-science') {
          const init = initialNumpyState(c)
          setNumpyFn(init.fn)
          setArrayLen(init.len)
        }
      })
      .catch(() => setError('Concept not found.'))
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
    (e: ReactMouseEvent) => {
      e.preventDefault()
      const startX = e.clientX
      const startW = rightWidth

      const onMove = (ev: globalThis.MouseEvent) => {
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

  const title = lesson?.title
  const difficulty = lesson?.difficulty

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

  const libraryLabel = LIBRARY_LABELS[labId]

  if (labId === 'system-design' && lesson) {
    return (
      <WithProgress labId={labId} slug={slug}>
        <ConceptLessonLayout>
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
              <DynamicCodePanel
                files={lesson.codeFiles ?? []}
                extraActions={lesson.slug === 'caching' ? <CachingPracticeDownload /> : undefined}
              />
            </div>
          </div>
        </ConceptLessonLayout>
      </WithProgress>
    )
  }

  if (labId === 'api-design' && lesson && lesson.vizType === 'api-lesson') {
    return (
      <WithProgress labId={labId} slug={slug}>
        <ConceptLessonLayout>
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
              <div className={`${styles.center} ${styles.centerGrow}`}>
                <ApiDesignLessonPanel summary={lesson.summary} slug={lesson.slug} />
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
              <DynamicCodePanel files={lesson.codeFiles ?? []} />
            </div>
          </div>
        </ConceptLessonLayout>
      </WithProgress>
    )
  }

  if (labId === 'design-patterns' && lesson?.vizType === 'singleton') {
    return (
      <WithProgress labId={labId} slug={slug}>
        <ConceptLessonLayout>
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
              <DynamicCodePanel files={lesson.codeFiles ?? []} />
            </div>
          </div>
        </ConceptLessonLayout>
      </WithProgress>
    )
  }

  if (labId === 'design-patterns' && lesson?.vizType === 'dependency-injection') {
    return (
      <WithProgress labId={labId} slug={slug}>
        <ConceptLessonLayout>
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
              <DependencyInjectionCodePanel files={lesson.codeFiles ?? []} />
            </div>
          </div>
        </ConceptLessonLayout>
      </WithProgress>
    )
  }

  if (labId === 'data-science' && lesson?.vizType === 'numerical') {
    return (
      <WithProgress labId={labId} slug={slug}>
        <ConceptLessonLayout>
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
                  parameters={lesson.parameters ?? []}
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
              <DynamicCodePanel files={lesson.codeFiles ?? []} />
            </div>
          </div>
        </ConceptLessonLayout>
      </WithProgress>
    )
  }

  if (labId === 'cloud-architecture' && lesson && lesson.vizType === 'cloud-lesson') {
    return (
      <WithProgress labId={labId} slug={slug}>
        <ConceptLessonLayout>
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
              <div className={`${styles.center} ${styles.centerGrow}`}>
                <CloudArchitectureLessonPanel summary={lesson.summary} slug={lesson.slug} />
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
              <DynamicCodePanel files={lesson.codeFiles ?? []} />
            </div>
          </div>
        </ConceptLessonLayout>
      </WithProgress>
    )
  }

  if (labId === 'low-level-systems' && lesson && lesson.vizType === 'low-level-lesson') {
    return (
      <WithProgress labId={labId} slug={slug}>
        <ConceptLessonLayout>
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
              <div className={`${styles.center} ${styles.centerGrow}`}>
                <LowLevelSystemsLessonPanel summary={lesson.summary} slug={lesson.slug} />
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
              <DynamicCodePanel files={lesson.codeFiles ?? []} />
            </div>
          </div>
        </ConceptLessonLayout>
      </WithProgress>
    )
  }

  if (labId === 'database-design' && lesson?.vizType === 'db-lesson') {
    return (
      <WithProgress labId={labId} slug={slug}>
        <ConceptLessonLayout>
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
              <div className={`${styles.center} ${styles.centerGrow}`}>
                <DatabaseDesignLessonPanel summary={lesson.summary} slug={lesson.slug} />
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
              <DynamicCodePanel files={lesson.codeFiles ?? []} />
            </div>
          </div>
        </ConceptLessonLayout>
      </WithProgress>
    )
  }

  if (lesson && LABS_AWAITING_LESSON_UI.includes(labId)) {
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
