import {
  useCallback,
  useEffect,
  useState,
  type ComponentType,
  type MouseEvent as ReactMouseEvent,
  type ReactNode,
} from 'react'
import { useParams, Link, useSearchParams } from 'react-router-dom'
import { fetchSectionLesson } from '@/features/lessons/curriculumApi'
import { LAB_OPTIONS, useLab, type LabId } from '@/contexts/lab'
import DynamicCodePanel from '@/components/code/DynamicCodePanel'
import ParametersPanel from '@/components/panels/ParametersPanel'
import MetricsPanel from '@/components/panels/MetricsPanel'
import { VIZ_REGISTRY } from '@/features/concepts/vizRegistry'
import { LESSON_REGISTRY, type LessonPanelProps } from '@/features/lessons/lessonRegistry'
import type { LabConceptDetail } from '@/types/labConcept'
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

const MIN_WIDTH = 260
const MAX_WIDTH = 680

const VALID_LAB_IDS = new Set<LabId>(LAB_OPTIONS.map(o => o.id))

/** Lesson panel when vizType is `lesson`, missing, or not a registered simulation. */
function resolveLessonPanelComponent(
  lesson: LabConceptDetail,
): ComponentType<LessonPanelProps> | undefined {
  const panel = LESSON_REGISTRY[lesson.slug]
  if (!panel) return undefined
  const vt = lesson.vizType
  if (vt === 'lesson') return panel
  if (vt == null || vt === '') return panel
  if (typeof vt === 'string' && !VIZ_REGISTRY[vt]) return panel
  return undefined
}

const LIBRARY_LABELS: Record<LabId, string> = {
  'system-design':         'Concept Library',
  'api-design':            'API Design',
  concurrency:             'Concurrency',
  networking:              'Networking',
  security:                'Security',
  'software-architecture': 'Software Architecture',
  testing:                 'Testing',
  devops:                  'DevOps',
  'low-level-systems':     'Low-Level Systems',
  'operating-systems':     'Operating Systems',
  algorithms:              'Algorithms & Data Structures',
  'ai-systems':            'AI Systems',
  'programming-languages': 'Programming Languages',
  'design-patterns':       'Design Patterns',
  'data-science':          'Data Science',
  'database-design':       'Database Design',
  'cloud-architecture':    'Cloud Architecture',
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

  const [lesson, setLesson] = useState<import('@/types/labConcept').LabConceptDetail | null>(null)
  const [error, setError] = useState<string | null>(null)

  const [isRunning, setRunning] = useState(false)

  const [paramValues, setParamValues] = useState<Record<string, number | boolean | string>>({})
  const [metricValues, setMetricValues] = useState<Record<string, string>>({})

  const handleParamChange = useCallback((id: string, value: number | boolean | string) => {
    setParamValues(prev => ({ ...prev, [id]: value }))
  }, [])

  const [rightWidth, setRightWidth] = useState(400)

  useEffect(() => {
    if (!slug) return
    setError(null)
    setLesson(null)

    fetchSectionLesson(labId, slug)
      .then(c => {
        setLesson(c)
        if (c.parameters?.length) {
          const defaults: Record<string, number | boolean | string> = {}
          for (const p of c.parameters) {
            if (p.type === 'toggle') defaults[p.id] = p.defaultBool ?? false
            else if (p.type === 'select') defaults[p.id] = p.defaultOption ?? (p.options?.[0] ?? '')
            else defaults[p.id] = p.default ?? p.min ?? 0
          }
          setParamValues(defaults)
        }
      })
      .catch(() => setError('Concept not found.'))
  }, [slug, labId])

  const handleToggleRun = () => setRunning(r => !r)

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

  if (error) {
    return (
      <div className={styles.errorPage}>
        <p>{error}</p>
        <Link to="/" className={styles.backLink}>← Back to library</Link>
      </div>
    )
  }

  const title       = lesson?.title
  const difficulty  = lesson?.difficulty
  const libraryLabel = LIBRARY_LABELS[labId]

  const pageHeader = (
    <div className={styles.pageHeader}>
      <div className={styles.breadcrumb}>
        <Link to="/" className={styles.breadcrumbLink}>{libraryLabel}</Link>
        <span className={styles.breadcrumbSep}>›</span>
        <span className={styles.breadcrumbCurrent}>{title ?? '…'}</span>
      </div>
      {difficulty && <span className={`badge badge--${difficulty}`}>{difficulty}</span>}
    </div>
  )

  const dragHandle = (
    <div className={styles.dragHandle} onMouseDown={handleDragStart} title="Drag to resize">
      <div className={styles.dragDots} />
    </div>
  )

  // ── Interactive visualizer path ───────────────────────────────────────────
  // Any concept whose vizType is in VIZ_REGISTRY renders here (caching, singleton, DI, numerical…).
  // To add a new one: write a thin adapter in vizRegistry.tsx and add concept JSON config.
  const VizComp = lesson ? VIZ_REGISTRY[lesson.vizType] : undefined
  if (VizComp && lesson) {
    return (
      <WithProgress labId={labId} slug={slug}>
        <ConceptLessonLayout labId={labId} conceptSlug={slug ?? ''} practice={lesson.practice}>
          {pageHeader}
          <div className={styles.mainArea} style={{ gridTemplateColumns: `1fr 6px ${rightWidth}px` }}>
            <div className={styles.leftCol}>
              <div className={styles.center}>
                <VizComp
                  paramValues={paramValues}
                  onMetrics={setMetricValues}
                  isRunning={isRunning}
                  onToggleRun={handleToggleRun}
                />
              </div>
              <div className={styles.bottom}>
                <div className={styles.bottomPanels}>
                  <ParametersPanel
                    parameters={lesson.parameters ?? []}
                    values={paramValues}
                    onChange={handleParamChange}
                  />
                  <MetricsPanel
                    groups={lesson.metricGroups ?? []}
                    values={metricValues}
                    isRunning={isRunning}
                  />
                </div>
              </div>
            </div>
            {dragHandle}
            <div className={styles.right}>
              <DynamicCodePanel
                files={lesson.codeFiles ?? []}
              />
            </div>
          </div>
        </ConceptLessonLayout>
      </WithProgress>
    )
  }

  // ── Lesson text path ──────────────────────────────────────────────────────
  // Registered slugs in LESSON_REGISTRY; vizType should be `lesson` (may be omitted in Mongo).
  const LessonComp = lesson ? resolveLessonPanelComponent(lesson) : undefined
  if (LessonComp && lesson) {
    return (
      <WithProgress labId={labId} slug={slug}>
        <ConceptLessonLayout labId={labId} conceptSlug={slug ?? ''} practice={lesson.practice}>
          {pageHeader}
          <div className={styles.mainArea} style={{ gridTemplateColumns: `1fr 6px ${rightWidth}px` }}>
            <div className={styles.leftCol}>
              <div className={`${styles.center} ${styles.centerGrow}`}>
                <LessonComp summary={lesson.summary} />
              </div>
            </div>
            {dragHandle}
            <div className={styles.right}>
              <DynamicCodePanel files={lesson.codeFiles ?? []} />
            </div>
          </div>
        </ConceptLessonLayout>
      </WithProgress>
    )
  }

  // Lesson loaded from API but no visualizer / lesson panel is registered — avoid infinite "Loading…"
  if (lesson) {
    return (
      <div className={styles.page}>
        <div className={styles.errorPage}>
          <p>This concept is not wired to a lesson UI yet.</p>
          <p className={styles.errorMeta}>
            <code>vizType</code>: {lesson.vizType} · <code>slug</code>: {lesson.slug}
          </p>
          <p className={styles.errorHint}>
            Add the slug to <code>LESSON_REGISTRY</code> (if <code>vizType</code> is <code>lesson</code>) or register{' '}
            <code>vizType</code> in <code>VIZ_REGISTRY</code>.
          </p>
          <Link to="/" className={styles.backLink}>← Back to library</Link>
        </div>
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
