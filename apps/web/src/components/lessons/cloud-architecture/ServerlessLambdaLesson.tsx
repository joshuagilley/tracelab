import {
  LessonRoot,
  LessonProblem,
  LessonDiagram,
  LessonTradeoffs,
  LessonEm,
} from '@/components/lesson-panels/LessonPanel'

export default function ServerlessLambdaLesson({ summary }: { summary: string }) {
  return (
    <LessonRoot>
      <LessonProblem>{summary}</LessonProblem>
      <LessonDiagram label="Event-driven">
        <svg width="280" height="90" viewBox="0 0 280 90" aria-label="event triggering function">
          <text x="40" y="52" textAnchor="middle" fill="var(--text-secondary)" fontSize="9">
            Event
          </text>
          <rect x="95" y="28" width="90" height="40" rx="6" fill="var(--bg-base)" stroke="var(--accent)" />
          <text x="140" y="52" textAnchor="middle" fill="var(--text-primary)" fontSize="9" fontWeight="600">
            Function
          </text>
          <text x="245" y="52" textAnchor="middle" fill="var(--text-secondary)" fontSize="9">
            Downstream
          </text>
          <path d="M 70 48 L 92 48" stroke="var(--accent)" strokeWidth="1.5" />
          <path d="M 187 48 L 210 48" stroke="var(--accent)" strokeWidth="1.5" />
        </svg>
      </LessonDiagram>
      <LessonTradeoffs>
        <li>
          <LessonEm>Win:</LessonEm> no idle servers, fast to iterate, integrates with queues and API gateways.
        </li>
        <li>
          <LessonEm>Watch:</LessonEm> cold starts, timeouts, and secrets — never ship keys in the bundle.
        </li>
      </LessonTradeoffs>
    </LessonRoot>
  )
}
