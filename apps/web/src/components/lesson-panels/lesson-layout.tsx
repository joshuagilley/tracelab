import { Children, useRef, useState, type ChangeEvent, type ReactNode } from 'react'
import { useAuth } from '@/contexts/auth'
import type { LabId } from '@/contexts/lab'
import { useConceptProgress } from '@/contexts/conceptProgress'
import { downloadPracticeZip } from '@/lib/practice-zip'
import {
  dispatchCompletedUpdated,
  submitConceptLab,
  type SubmittedFile,
} from '@/features/learning/api/completed-api'
import type { PracticeConfig } from '@/types/lab-concept'
import styles from '@/features/learning/pages/lesson-page.module.css'

/** Wraps the lesson page shell; mark-done under the header + full-page “done” styling. */
export default function LessonLayout({
  children,
  labId,
  conceptSlug,
  practice,
}: {
  children: ReactNode
  labId: LabId
  conceptSlug: string
  practice?: PracticeConfig
}) {
  const { conceptFullyDone, canPersist, loaded, applyCompletionStatus } = useConceptProgress()
  const { githubLoginHref } = useAuth()
  const folderInputRef = useRef<HTMLInputElement | null>(null)
  const [submitBusy, setSubmitBusy] = useState(false)
  const [submitMessage, setSubmitMessage] = useState<string>('')
  const [submitTestOutput, setSubmitTestOutput] = useState<string | null>(null)
  const [submitOutputTone, setSubmitOutputTone] = useState<'fail' | 'pass' | null>(null)

  const parts = Children.toArray(children)
  const pageHeader = parts[0]
  const rest = parts.slice(1)

  const onSubmitFolderPick = async (e: ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files
    if (!selected || selected.length === 0) return

    const payload: SubmittedFile[] = await Promise.all(
      Array.from(selected).map(async file => ({
        name: file.webkitRelativePath || file.name,
        content: await file.text(),
      })),
    )

    setSubmitBusy(true)
    setSubmitMessage('')
    setSubmitTestOutput(null)
    setSubmitOutputTone(null)
    try {
      const result = await submitConceptLab(labId, conceptSlug, payload)
      if (!result) {
        setSubmitMessage('Sign in to submit your lab.')
        return
      }

      if (result.completed && result.passed) {
        applyCompletionStatus({ completed: true, completedAt: result.completedAt })
        dispatchCompletedUpdated(labId)
        setSubmitMessage('Tests passed. Concept marked complete.')
        const out = result.output?.trim()
        if (out) {
          setSubmitTestOutput(result.output)
          setSubmitOutputTone('pass')
        }
        return
      }

      setSubmitMessage('Tests failed. Fix the issues below and submit again.')
      setSubmitTestOutput(result.output?.trim() ? result.output : '(No test output — check that main.go was included.)')
      setSubmitOutputTone('fail')
    } catch {
      setSubmitMessage('Submit failed. Please try again.')
    } finally {
      setSubmitBusy(false)
      e.target.value = ''
    }
  }

  const markDoneBar = (
    <div
      className={`${styles.markDoneBar} ${conceptFullyDone ? styles.markDoneBarComplete : ''}`}
    >
      <div className={styles.markDoneBarRow}>
        <div className={styles.markDoneBarText}>
          {conceptFullyDone ? (
            <>
              <span className={styles.markDoneBarTitle}>Concept complete</span>
              <span className={styles.markDoneBarSub}>Lab submission passed tests and was saved.</span>
            </>
          ) : (
            <>
              <span className={styles.markDoneBarTitle}>{practice ? 'Lab workflow' : 'Progress'}</span>
              <span className={styles.markDoneBarSub}>
                {practice
                  ? 'Download the lab, complete it locally, then submit the folder to run canonical tests.'
                  : 'This concept has no downloadable lab.'}
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
          {practice && (
            <>
              <button
                type="button"
                className={styles.markDoneBtn}
                disabled={!loaded}
                onClick={() => downloadPracticeZip(practice)}
              >
                Download Lab
              </button>
              <button
                type="button"
                className={`${styles.markDoneBtn} ${conceptFullyDone ? styles.markDoneBtnDone : ''}`}
                disabled={!canPersist || !loaded || submitBusy}
                onClick={() => folderInputRef.current?.click()}
                aria-busy={submitBusy}
              >
                {submitBusy ? 'Submitting…' : conceptFullyDone ? 'Submit Again' : 'Submit Lab'}
              </button>
              <input
                ref={folderInputRef}
                type="file"
                style={{ display: 'none' }}
                {...({ webkitdirectory: 'true', directory: 'true' } as Record<string, string>)}
                onChange={e => {
                  void onSubmitFolderPick(e)
                }}
              />
            </>
          )}
        </div>
      </div>
      {submitMessage && <div className={styles.markDoneStatus}>{submitMessage}</div>}
      {submitTestOutput && (
        <div className={styles.submitOutputWrap}>
          <div className={styles.submitOutputLabel}>
            {submitOutputTone === 'fail' ? 'Test output' : 'Test output (verbose)'}
          </div>
          <pre
            className={
              submitOutputTone === 'fail' ? styles.submitTestOutputFail : styles.submitTestOutputPass
            }
            tabIndex={0}
            aria-live={submitOutputTone === 'fail' ? 'assertive' : 'polite'}
          >
            {submitTestOutput}
          </pre>
        </div>
      )}
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
