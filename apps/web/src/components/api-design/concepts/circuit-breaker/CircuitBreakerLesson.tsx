import {
  LessonRoot,
  LessonProblem,
  LessonDiagram,
  LessonTradeoffs,
  LessonEm,
} from '@/components/lesson-panels/LessonPanel'

export default function CircuitBreakerLesson({ summary }: { summary: string }) {
  return (
    <LessonRoot>
      <LessonProblem>{summary}</LessonProblem>
      <LessonDiagram label="Caller protection">
        <svg width="300" height="100" viewBox="0 0 300 100" aria-label="circuit open blocks calls to failing service">
          <text x="50" y="55" textAnchor="middle" fill="var(--text-secondary)" fontSize="9">
            API
          </text>
          <rect x="100" y="32" width="60" height="36" rx="6" fill="var(--bg-base)" stroke="var(--accent)" />
          <text x="130" y="54" textAnchor="middle" fill="var(--text-primary)" fontSize="8" fontWeight="600">
            CB
          </text>
          <text x="250" y="55" textAnchor="middle" fill="var(--text-secondary)" fontSize="9">
            Downstream
          </text>
          <path d="M 75 50 L 98 50" stroke="var(--accent)" strokeWidth="1.5" />
          <path d="M 162 50 L 215 50" stroke="var(--text-muted)" strokeWidth="1.5" strokeDasharray="4 3" />
          <text x="188" y="42" textAnchor="middle" fill="var(--text-muted)" fontSize="7">
            open — fail fast
          </text>
        </svg>
      </LessonDiagram>
      <LessonTradeoffs>
        <li>
          <LessonEm>Win:</LessonEm> failing dependencies do not soak threads and timeouts.
        </li>
        <li>
          <LessonEm>Tuning:</LessonEm> thresholds and half-open probes must match real SLOs.
        </li>
      </LessonTradeoffs>
    </LessonRoot>
  )
}
