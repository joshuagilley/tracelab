import {
  LessonRoot,
  LessonProblem,
  LessonDiagram,
  LessonTradeoffs,
  LessonEm,
} from '@/components/lesson-panels/LessonPanel'

export default function QueueSqsLesson({ summary }: { summary: string }) {
  return (
    <LessonRoot>
      <LessonProblem>{summary}</LessonProblem>
      <LessonDiagram label="Async pipeline">
        <svg width="300" height="100" viewBox="0 0 300 100" aria-label="producer queue consumer and DLQ">
          <text x="35" y="55" textAnchor="middle" fill="var(--text-secondary)" fontSize="9">
            Producer
          </text>
          <rect x="75" y="32" width="56" height="36" rx="6" fill="var(--bg-base)" stroke="var(--accent)" />
          <text x="103" y="54" textAnchor="middle" fill="var(--text-primary)" fontSize="8" fontWeight="600">
            Queue
          </text>
          <text x="200" y="40" textAnchor="middle" fill="var(--text-secondary)" fontSize="8">
            Consumer
          </text>
          <rect x="165" y="52" width="70" height="28" rx="4" fill="var(--bg-subtle)" stroke="var(--border)" />
          <text x="200" y="68" textAnchor="middle" fill="var(--text-muted)" fontSize="7">
            DLQ
          </text>
          <path d="M 60 50 L 73 50" stroke="var(--accent)" strokeWidth="1.5" />
          <path d="M 133 50 L 165 50" stroke="var(--accent)" strokeWidth="1.5" />
        </svg>
      </LessonDiagram>
      <LessonTradeoffs>
        <li>
          <LessonEm>Win:</LessonEm> smooth spikes, scale workers independently, isolate failures with a DLQ.
        </li>
        <li>
          <LessonEm>Watch:</LessonEm> visibility timeout, idempotency, and poison messages — tune all three.
        </li>
      </LessonTradeoffs>
    </LessonRoot>
  )
}
