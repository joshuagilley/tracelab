import {
  LessonRoot,
  LessonProblem,
  LessonDiagram,
  LessonTradeoffs,
  LessonEm,
} from '@/components/lesson-panels/LessonPanel'

export default function RetriesLesson({ summary }: { summary: string }) {
  return (
    <LessonRoot>
      <LessonProblem>{summary}</LessonProblem>
      <LessonDiagram label="Client retry spacing">
        <svg width="280" height="90" viewBox="0 0 280 90" aria-label="exponential backoff timeline">
          <text x="30" y="48" fill="var(--text-muted)" fontSize="9">
            t0
          </text>
          <text x="100" y="48" fill="var(--text-muted)" fontSize="9">
            t1
          </text>
          <text x="180" y="48" fill="var(--text-muted)" fontSize="9">
            t2
          </text>
          <text x="250" y="48" fill="var(--text-muted)" fontSize="9">
            t3
          </text>
          <path d="M 20 60 L 260 60" stroke="var(--border)" strokeWidth="1" />
          <circle cx="30" cy="60" r="4" fill="var(--accent)" />
          <circle cx="100" cy="60" r="4" fill="var(--accent)" />
          <circle cx="180" cy="60" r="4" fill="var(--accent)" />
          <text x="140" y="22" textAnchor="middle" fill="var(--text-secondary)" fontSize="9">
            increasing gaps + jitter
          </text>
        </svg>
      </LessonDiagram>
      <LessonTradeoffs>
        <li>
          <LessonEm>Win:</LessonEm> transient blips recover without operator paging.
        </li>
        <li>
          <LessonEm>Risk:</LessonEm> synchronized retries amplify outages — always jitter and cap attempts.
        </li>
      </LessonTradeoffs>
    </LessonRoot>
  )
}
