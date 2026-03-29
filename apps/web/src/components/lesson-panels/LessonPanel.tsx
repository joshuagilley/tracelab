import { type ReactNode } from 'react'
import styles from './LessonPanel.module.css'

export function LessonRoot({ children }: { children: ReactNode }) {
  return <div className={styles.wrap}>{children}</div>
}

export function LessonProblem({ children }: { children: ReactNode }) {
  return <p className={styles.problem}>{children}</p>
}

export function LessonDiagram({
  label,
  children,
  tall,
}: {
  label: string
  children: ReactNode
  tall?: boolean
}) {
  return (
    <div
      className={[styles.diagramCard, tall ? styles.diagramCardTall : ''].filter(Boolean).join(' ')}
    >
      <span className={styles.diagramLabel}>{label}</span>
      <div className={styles.diagramBody}>{children}</div>
    </div>
  )
}

export function LessonTradeoffs({ children }: { children: ReactNode }) {
  return (
    <div className={styles.tradeoffs}>
      <p className={styles.tradeoffsTitle}>Tradeoffs</p>
      <ul>{children}</ul>
    </div>
  )
}

export function LessonTakeaway({ children }: { children: ReactNode }) {
  return (
    <div className={styles.takeaway}>
      <p className={styles.takeawayTitle}>Takeaway</p>
      <div className={styles.takeawayContent}>{children}</div>
    </div>
  )
}

export function LessonBottomNote({ children }: { children: ReactNode }) {
  return <p className={styles.bottomNote}>{children}</p>
}

export function LessonEm({ children }: { children: ReactNode }) {
  return <span className={styles.em}>{children}</span>
}

export function LessonMono({ children }: { children: ReactNode }) {
  return <span className={styles.mono}>{children}</span>
}

export function LessonPlaceholder({ summary }: { summary: string }) {
  return (
    <LessonRoot>
      <LessonProblem>{summary}</LessonProblem>
      <LessonDiagram label="Diagram">
        <LessonBottomNote>Visual for this topic is not wired yet.</LessonBottomNote>
      </LessonDiagram>
    </LessonRoot>
  )
}
