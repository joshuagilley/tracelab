import {
  LessonRoot,
  LessonProblem,
  LessonDiagram,
  LessonTradeoffs,
  LessonEm,
} from '@/components/lesson-panels/LessonPanel'

export default function LoadBalancerL4L7Lesson({ summary }: { summary: string }) {
  return (
    <LessonRoot>
      <LessonProblem>{summary}</LessonProblem>
      <LessonDiagram label="Request flow">
        <svg width="300" height="100" viewBox="0 0 300 100" aria-label="clients through load balancer to targets">
          <text x="40" y="55" textAnchor="middle" fill="var(--text-secondary)" fontSize="9">
            Clients
          </text>
          <rect x="110" y="32" width="70" height="36" rx="6" fill="var(--bg-base)" stroke="var(--accent)" />
          <text x="145" y="54" textAnchor="middle" fill="var(--text-primary)" fontSize="9" fontWeight="600">
            LB
          </text>
          <text x="145" y="78" textAnchor="middle" fill="var(--text-muted)" fontSize="7">
            L4 or L7
          </text>
          <text x="260" y="55" textAnchor="middle" fill="var(--text-secondary)" fontSize="9">
            Targets
          </text>
          <path d="M 80 50 L 108 50" stroke="var(--accent)" strokeWidth="1.5" />
          <path d="M 182 50 L 220 50" stroke="var(--accent)" strokeWidth="1.5" />
        </svg>
      </LessonDiagram>
      <LessonTradeoffs>
        <li>
          <LessonEm>L7:</LessonEm> TLS, routing, WAF hooks — more features, slightly more latency.
        </li>
        <li>
          <LessonEm>L4:</LessonEm> great for non-HTTP protocols or passing TLS through to apps.
        </li>
      </LessonTradeoffs>
    </LessonRoot>
  )
}
