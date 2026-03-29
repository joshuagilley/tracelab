import { Children, type ReactNode } from 'react'
import { useAuth } from '@/contexts/auth'
import { useConceptProgress } from '@/contexts/conceptProgress'
import styles from '@/features/concepts/pages/ConceptDetailPage.module.css'

/** Wraps the concept detail page shell; mark-done under the header + full-page “done” styling. */
export default function ConceptLessonLayout({ children }: { children: ReactNode }) {
  const { conceptFullyDone, canPersist, loaded, toggleConceptDone } = useConceptProgress()
  const { githubLoginHref } = useAuth()

  const parts = Children.toArray(children)
  const pageHeader = parts[0]
  const rest = parts.slice(1)

  const markDoneBar = (
    <div
      className={`${styles.markDoneBar} ${conceptFullyDone ? styles.markDoneBarComplete : ''}`}
    >
      <div className={styles.markDoneBarText}>
        {conceptFullyDone ? (
          <>
            <span className={styles.markDoneBarTitle}>Concept complete</span>
            <span className={styles.markDoneBarSub}>Marked done — same highlight in the sidebar list.</span>
          </>
        ) : (
          <>
            <span className={styles.markDoneBarTitle}>Progress</span>
            <span className={styles.markDoneBarSub}>
              One click marks this whole lesson done when you are finished with it.
            </span>
          </>
        )}
      </div>
      <div className={styles.markDoneBarActions}>
        {!canPersist && (
          <span className={styles.markDoneHint}>
            <a href={githubLoginHref}>Sign in</a> to save.
          </span>
        )}
        <button
          type="button"
          className={`${styles.markDoneBtn} ${conceptFullyDone ? styles.markDoneBtnDone : ''}`}
          disabled={!canPersist || !loaded}
          onClick={() => void toggleConceptDone()}
          aria-pressed={conceptFullyDone}
        >
          {conceptFullyDone ? 'Completed' : 'Mark concept done'}
        </button>
      </div>
    </div>
  )

  return (
    <div
      className={`${styles.page} ${conceptFullyDone ? styles.pageConceptComplete : ''}`}
      data-concept-complete={conceptFullyDone ? 'true' : 'false'}
    >
      {pageHeader}
      {parts.length >= 2 ? (
        <>
          {markDoneBar}
          {rest}
        </>
      ) : (
        <>
          {markDoneBar}
          {children}
        </>
      )}
    </div>
  )
}
