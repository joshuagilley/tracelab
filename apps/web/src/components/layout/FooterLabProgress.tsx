import { useMemo } from 'react'
import { useGlobalConceptProgress } from '@/contexts/globalConceptProgress'
import styles from './FooterLabProgress.module.css'

export default function FooterLabProgress() {
  const { completed, total, loading } = useGlobalConceptProgress()

  const pct = useMemo(
    () => (total > 0 ? Math.round((completed / total) * 100) : 0),
    [completed, total],
  )

  if (loading) {
    return (
      <span className={styles.wrap} aria-busy="true" aria-label="Loading overall progress">
        <span className={styles.label}>Topics</span>
        <span className={styles.muted}>…</span>
      </span>
    )
  }

  if (total === 0) {
    return (
      <span className={styles.wrap} title="No published lessons across libraries yet">
        <span className={styles.label}>Topics</span>
        <span className={styles.muted}>—</span>
      </span>
    )
  }

  return (
    <span
      className={styles.wrap}
      title={`Overall: ${completed} of ${total} available topics marked done across all libraries (signed-in progress)`}
    >
      <span className={styles.label}>Topics</span>
      <span className={styles.fraction}>
        {completed}/{total}
      </span>
      <span className={styles.track} aria-hidden>
        <span className={styles.fill} style={{ width: `${pct}%` }} />
      </span>
      <span className={styles.pct}>{pct}%</span>
    </span>
  )
}
