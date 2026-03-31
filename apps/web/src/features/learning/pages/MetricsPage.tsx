import { useEffect, useMemo, useState } from 'react'
import { useCareerTrack } from '@/contexts/careerTrack'
import { useAuth } from '@/contexts/auth'
import { LAB_OPTIONS, type LabId } from '@/contexts/lab'
import { fetchSectionConcepts } from '@/features/curriculum/curriculum-api'
import { fetchLabCompletedDetails } from '@/features/learning/api/completed-api'
import { matchesTrackTags } from '@/lib/track-filter'
import type { CertificationOption } from '@/lib/certifications/api'
import { EXPERT_CERTIFICATION } from '@/lib/certifications/defaults'
import styles from './MetricsPage.module.css'

type ConceptWithLab = {
  labId: LabId
  slug: string
  status: 'available' | 'coming-soon'
  tags: string[]
}

type LanguageMetric = {
  id: string
  label: string
  weightedPercent: number
  submissionPercent: number
  labSpacePercent: number
  submissionCompleted: number
  submissionTotal: number
  labSpaceCompleted: number
  labSpaceTotal: number
}

const LANGUAGE_KEYS: Array<{ id: string; label: string; tags: string[] }> = [
  { id: 'go', label: 'Go', tags: ['go', 'golang'] },
  { id: 'python', label: 'Python', tags: ['python', 'py'] },
  { id: 'typescript', label: 'TypeScript', tags: ['typescript', 'ts'] },
]

function conceptKey(labId: LabId, slug: string): string {
  return `${labId}::${slug}`
}

function pct(completed: number, total: number): number {
  if (total <= 0) return 0
  return Math.round((completed / total) * 100)
}

function certificationProgress(
  certification: CertificationOption,
  publishedConcepts: ConceptWithLab[],
  completed: ReadonlySet<string>,
): { completed: number; total: number; earned: boolean } {
  const isAllPublished =
    certification.id === 'generalist' || certification.id === 'expert' || !certification.trackTags?.length
  const inTrack = isAllPublished
    ? publishedConcepts
    : publishedConcepts.filter(c =>
        matchesTrackTags(
          {
            id: c.slug,
            title: c.slug,
            slug: c.slug,
            summary: '',
            difficulty: 'easy',
            status: c.status,
            tags: c.tags,
          },
          certification.trackTags ?? [],
        ),
      )
  const total = inTrack.length
  const done = inTrack.reduce((acc, concept) => acc + (completed.has(conceptKey(concept.labId, concept.slug)) ? 1 : 0), 0)
  return { completed: done, total, earned: total > 0 && done >= total }
}

export default function MetricsPage() {
  const { user } = useAuth()
  const { selectedTrack, certifications } = useCareerTrack()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [publishedConcepts, setPublishedConcepts] = useState<ConceptWithLab[]>([])
  const [completedConceptKeys, setCompletedConceptKeys] = useState<Set<string>>(new Set())
  const [completedLanguageByConcept, setCompletedLanguageByConcept] = useState<Record<string, string[]>>({})

  useEffect(() => {
    let cancelled = false
    const run = async () => {
      setLoading(true)
      setError(null)
      try {
        const conceptLists = await Promise.all(
          LAB_OPTIONS.map(async ({ id }) => {
            const concepts = await fetchSectionConcepts(id)
            return concepts.map(c => ({ labId: id, slug: c.slug, status: c.status, tags: c.tags ?? [] }))
          }),
        )
        if (cancelled) return
        const published = conceptLists.flat().filter(c => c.status === 'available')
        setPublishedConcepts(published)

        if (!user) {
          setCompletedConceptKeys(new Set())
          setCompletedLanguageByConcept({})
          return
        }
        const completedDetails = await Promise.all(
          LAB_OPTIONS.map(async ({ id }) => {
            const rows = await fetchLabCompletedDetails(id)
            return rows.map(row => ({
              key: conceptKey(id, row.slug),
              languages: (row.languages ?? []).map(lang => normalizeLanguage(lang)).filter(Boolean),
            }))
          }),
        )
        if (cancelled) return
        const flat = completedDetails.flat()
        setCompletedConceptKeys(new Set(flat.map(row => row.key)))
        const byConcept: Record<string, string[]> = {}
        for (const row of flat) {
          byConcept[row.key] = row.languages
        }
        setCompletedLanguageByConcept(byConcept)
      } catch {
        if (!cancelled) setError('Could not load metrics right now. Confirm the API is running.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    void run()
    return () => {
      cancelled = true
    }
  }, [user])

  const trackMetrics = useMemo(() => {
    if (!selectedTrack) return { completed: 0, total: 0 }
    const rows = certificationProgress(selectedTrack, publishedConcepts, completedConceptKeys)
    return { completed: rows.completed, total: rows.total }
  }, [selectedTrack, publishedConcepts, completedConceptKeys])

  const overallMetrics = useMemo(
    () => ({
      total: publishedConcepts.length,
      completed: Array.from(completedConceptKeys).length,
    }),
    [publishedConcepts, completedConceptKeys],
  )

  const languageMetrics = useMemo<LanguageMetric[]>(() => {
    const submissionTotal = publishedConcepts.length
    const programmingLanguageConcepts = publishedConcepts.filter(c => c.labId === 'programming-languages')
    return LANGUAGE_KEYS.map(lang => {
      let submissionDone = 0
      for (const langs of Object.values(completedLanguageByConcept)) {
        if (langs.includes(lang.id)) submissionDone += 1
      }
      const inLanguageLab = programmingLanguageConcepts.filter(concept =>
        concept.tags.some(tag => lang.tags.includes(String(tag).toLowerCase())),
      )
      let inLanguageLabDone = 0
      for (const concept of inLanguageLab) {
        if (completedConceptKeys.has(conceptKey(concept.labId, concept.slug))) inLanguageLabDone += 1
      }
      const submissionPercent = pct(submissionDone, submissionTotal)
      const labSpacePercent = pct(inLanguageLabDone, inLanguageLab.length)
      const weightedPercent = Math.round(submissionPercent * 0.5 + labSpacePercent * 0.5)
      return {
        id: lang.id,
        label: lang.label,
        weightedPercent,
        submissionPercent,
        labSpacePercent,
        submissionCompleted: submissionDone,
        submissionTotal,
        labSpaceCompleted: inLanguageLabDone,
        labSpaceTotal: inLanguageLab.length,
      }
    })
  }, [publishedConcepts, completedLanguageByConcept, completedConceptKeys])

  const badgeList = useMemo<CertificationOption[]>(() => {
    const byId = new Map(certifications.map(cert => [cert.id, cert]))
    byId.set(EXPERT_CERTIFICATION.id, EXPERT_CERTIFICATION)
    return Array.from(byId.values()).sort((a, b) => a.sortOrder - b.sortOrder)
  }, [certifications])

  const badgeProgress = useMemo(
    () =>
      badgeList.map(cert => ({
        cert,
        ...certificationProgress(cert, publishedConcepts, completedConceptKeys),
      })),
    [badgeList, publishedConcepts, completedConceptKeys],
  )

  const currentBadgeProgress = useMemo(
    () =>
      selectedTrack
        ? certificationProgress(selectedTrack, publishedConcepts, completedConceptKeys)
        : { completed: 0, total: 0, earned: false },
    [selectedTrack, publishedConcepts, completedConceptKeys],
  )

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1>TraceLab Metrics</h1>
        <p>Track your certification progress, language mastery, and earned badges across all published material.</p>
      </div>

      {error && <div className={styles.error}>{error}</div>}
      {loading && <div className={styles.loading}>Loading metrics…</div>}
      {!loading && !error && !selectedTrack && (
        <div className={styles.loading}>Select a career track from the badge menu to view track-specific metrics.</div>
      )}

      {!loading && !error && selectedTrack && (
        <>
          <section className={styles.topGrid}>
            <article className={styles.panel}>
              <h2>Current Certification</h2>
              <div className={styles.currentCert}>
                <img src={selectedTrack.imagePath} alt={`${selectedTrack.title} badge`} />
                <div>
                  <h3>{selectedTrack.title}</h3>
                  <p>{selectedTrack.description}</p>
                  <div className={styles.statInline}>
                    {currentBadgeProgress.completed}/{currentBadgeProgress.total} completed
                  </div>
                </div>
              </div>
            </article>

            <article className={styles.panel}>
              <h2>Completion Snapshot</h2>
              <div className={styles.snapshotRows}>
                <ProgressRow
                  label="Current track"
                  completed={trackMetrics.completed}
                  total={trackMetrics.total}
                />
                <ProgressRow
                  label="Overall published"
                  completed={overallMetrics.completed}
                  total={overallMetrics.total}
                />
              </div>
            </article>
          </section>

          <section className={styles.chartsGrid}>
            <article className={styles.panel}>
              <h2>Progress Chart</h2>
              <div className={styles.donutWrap}>
                <DonutChart
                  label="Track"
                  completed={trackMetrics.completed}
                  total={trackMetrics.total}
                  strokeClass={styles.trackStroke}
                />
                <DonutChart
                  label="Overall"
                  completed={overallMetrics.completed}
                  total={overallMetrics.total}
                  strokeClass={styles.overallStroke}
                />
              </div>
            </article>

            <article className={styles.panel}>
              <h2>Language Mastery</h2>
              <p className={styles.languageHelp}>
                Each language bar is weighted: 50% from labs you submitted in that language, and 50% from your
                completion progress in the Programming Languages library for that language.
              </p>
              <div className={styles.languageBars}>
                {languageMetrics.map(item => (
                  <LanguageProgressRow
                    key={item.id}
                    metric={item}
                  />
                ))}
              </div>
            </article>
          </section>

          <section className={styles.panel}>
            <h2>Badges Earned</h2>
            <div className={styles.badges}>
              {badgeProgress.map(row => (
                <div key={row.cert.id} className={styles.badgeCard}>
                  <img
                    src={row.cert.imagePath}
                    alt={`${row.cert.title} certification badge`}
                    className={row.earned ? styles.badgeColor : styles.badgeLocked}
                  />
                  <div className={styles.badgeMeta}>
                    <div className={styles.badgeTitle}>{row.cert.title}</div>
                    <div className={styles.badgeStat}>
                      {row.completed}/{row.total}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <p className={styles.portfolioNote}>
            When you complete a badge, we will email that certification to you so you can showcase it on your
            portfolio.
          </p>
        </>
      )}
    </div>
  )
}

function LanguageProgressRow({ metric }: { metric: LanguageMetric }) {
  return (
    <div className={styles.progressRow}>
      <div className={styles.progressHead}>
        <span>{metric.label}</span>
        <span>{metric.weightedPercent}%</span>
      </div>
      <div className={styles.progressTrack}>
        <div className={styles.progressFill} style={{ width: `${metric.weightedPercent}%` }} />
      </div>
      <div className={styles.languageSplit}>
        <span>
          Submissions: {metric.submissionCompleted}/{metric.submissionTotal} ({metric.submissionPercent}%)
        </span>
        <span>
          Programming Languages: {metric.labSpaceCompleted}/{metric.labSpaceTotal} ({metric.labSpacePercent}%)
        </span>
      </div>
    </div>
  )
}

function normalizeLanguage(raw: string): string {
  const lower = String(raw).trim().toLowerCase()
  if (lower === 'py') return 'python'
  if (lower === 'ts') return 'typescript'
  return lower
}

function ProgressRow({ label, completed, total }: { label: string; completed: number; total: number }) {
  const percent = pct(completed, total)
  return (
    <div className={styles.progressRow}>
      <div className={styles.progressHead}>
        <span>{label}</span>
        <span>
          {completed}/{total} ({percent}%)
        </span>
      </div>
      <div className={styles.progressTrack}>
        <div className={styles.progressFill} style={{ width: `${percent}%` }} />
      </div>
    </div>
  )
}

function DonutChart({
  label,
  completed,
  total,
  strokeClass,
}: {
  label: string
  completed: number
  total: number
  strokeClass: string
}) {
  const radius = 34
  const circumference = 2 * Math.PI * radius
  const percent = pct(completed, total)
  const offset = circumference - (circumference * percent) / 100
  return (
    <div className={styles.donut}>
      <svg viewBox="0 0 100 100" role="img" aria-label={`${label} completion ${percent}%`}>
        <circle className={styles.donutTrack} cx="50" cy="50" r={radius} />
        <circle
          className={strokeClass}
          cx="50"
          cy="50"
          r={radius}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <div className={styles.donutLabel}>
        <strong>{percent}%</strong>
        <span>{label}</span>
      </div>
    </div>
  )
}
