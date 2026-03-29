import {
  LessonRoot,
  LessonProblem,
  LessonDiagram,
  LessonTradeoffs,
  LessonBottomNote,
  LessonEm,
} from '@/components/lesson-panels/LessonPanel'

export default function RateLimitingLesson({ summary }: { summary: string }) {
  return (
    <LessonRoot>
      <LessonProblem>{summary}</LessonProblem>
      <LessonDiagram label="Request flow">
        <svg width="300" height="100" viewBox="0 0 300 100" aria-label="client through limiter to API">
          <text x="40" y="52" textAnchor="middle" fill="var(--text-secondary)" fontSize="9">
            Client
          </text>
          <rect x="85" y="30" width="70" height="40" rx="6" fill="var(--bg-base)" stroke="var(--accent)" />
          <text x="120" y="54" textAnchor="middle" fill="var(--text-primary)" fontSize="9" fontWeight="600">
            Limiter
          </text>
          <text x="250" y="52" textAnchor="middle" fill="var(--text-secondary)" fontSize="9">
            Your API
          </text>
          <path d="M 65 50 L 83 50" stroke="var(--accent)" strokeWidth="1.5" />
          <path d="M 157 50 L 215 50" stroke="var(--accent)" strokeWidth="1.5" />
          <text x="120" y="88" textAnchor="middle" fill="var(--text-muted)" fontSize="8">
            over quota → 429 + Retry-After
          </text>
        </svg>
      </LessonDiagram>
      <LessonTradeoffs>
        <li>
          <LessonEm>Win:</LessonEm> fair usage, abuse containment, predictable load on workers.
        </li>
        <li>
          <LessonEm>Design:</LessonEm> identify clients (key vs IP), document limits in OpenAPI, return 429 not 500.
        </li>
      </LessonTradeoffs>
      <LessonBottomNote>System Design picks queues and topology; here we shape the HTTP contract.</LessonBottomNote>
    </LessonRoot>
  )
}
