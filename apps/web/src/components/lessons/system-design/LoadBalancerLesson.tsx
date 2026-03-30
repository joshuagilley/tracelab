import {
  LessonRoot,
  LessonProblem,
  LessonDiagram,
  LessonTradeoffs,
  LessonEm,
} from '@/components/lesson-panels/LessonPanel'

/** System Design — Load Balancer: policies (round robin, least connections, …). Pairs with slug `load-balancing`. */
export default function LoadBalancerLesson({ summary }: { summary: string }) {
  return (
    <LessonRoot>
      <LessonProblem>{summary}</LessonProblem>
      <LessonDiagram label="Request assignment">
        <svg width="300" height="110" viewBox="0 0 300 110" aria-label="distributing requests across backends">
          <text x="40" y="55" textAnchor="middle" fill="var(--text-secondary)" fontSize="9">
            Requests
          </text>
          <path d="M 75 50 L 115 50" stroke="var(--accent)" strokeWidth="1.5" />
          <rect x="115" y="28" width="70" height="54" rx="6" fill="var(--bg-base)" stroke="var(--accent)" />
          <text x="150" y="50" textAnchor="middle" fill="var(--text-primary)" fontSize="9" fontWeight="600">
            Policy
          </text>
          <text x="150" y="68" textAnchor="middle" fill="var(--text-muted)" fontSize="7">
            RR / least-conn / …
          </text>
          <path d="M 185 42 L 225 32" stroke="var(--accent)" strokeWidth="1.2" />
          <path d="M 185 50 L 225 50" stroke="var(--accent)" strokeWidth="1.2" />
          <path d="M 185 58 L 225 68" stroke="var(--accent)" strokeWidth="1.2" />
          <text x="260" y="35" textAnchor="middle" fill="var(--text-secondary)" fontSize="8">
            A
          </text>
          <text x="260" y="52" textAnchor="middle" fill="var(--text-secondary)" fontSize="8">
            B
          </text>
          <text x="260" y="72" textAnchor="middle" fill="var(--text-secondary)" fontSize="8">
            C
          </text>
        </svg>
      </LessonDiagram>
      <LessonTradeoffs>
        <li>
          <LessonEm>Round robin:</LessonEm> simple and fair when work is uniform; blind to load or latency.
        </li>
        <li>
          <LessonEm>Least connections:</LessonEm> better when requests have uneven cost or duration.
        </li>
      </LessonTradeoffs>
    </LessonRoot>
  )
}
