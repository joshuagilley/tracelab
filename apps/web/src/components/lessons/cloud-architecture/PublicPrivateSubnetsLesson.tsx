import {
  LessonRoot,
  LessonProblem,
  LessonDiagram,
  LessonTradeoffs,
  LessonEm,
} from '@/components/lesson-panels/LessonPanel'

export default function PublicPrivateSubnetsLesson({ summary }: { summary: string }) {
  return (
    <LessonRoot>
      <LessonProblem>{summary}</LessonProblem>
      <LessonDiagram label="Traffic paths">
        <svg width="300" height="120" viewBox="0 0 300 120" aria-label="public versus private subnet traffic">
          <text x="70" y="18" textAnchor="middle" fill="var(--accent)" fontSize="10" fontWeight="600">
            Public
          </text>
          <text x="230" y="18" textAnchor="middle" fill="var(--accent)" fontSize="10" fontWeight="600">
            Private
          </text>
          <rect x="20" y="28" width="100" height="72" rx="6" fill="var(--bg-base)" stroke="var(--border)" />
          <text x="70" y="52" textAnchor="middle" fill="var(--text-secondary)" fontSize="9">
            IGW route
          </text>
          <text x="70" y="68" textAnchor="middle" fill="var(--text-muted)" fontSize="8">
            ALB / NAT
          </text>
          <rect x="180" y="28" width="100" height="72" rx="6" fill="var(--bg-base)" stroke="var(--border)" />
          <text x="230" y="55" textAnchor="middle" fill="var(--text-secondary)" fontSize="9">
            no direct
          </text>
          <text x="230" y="70" textAnchor="middle" fill="var(--text-muted)" fontSize="8">
            inbound internet
          </text>
          <path d="M 130 64 L 175 64" stroke="var(--accent)" strokeWidth="1" strokeDasharray="4 3" />
        </svg>
      </LessonDiagram>
      <LessonTradeoffs>
        <li>
          <LessonEm>Win:</LessonEm> databases and internal APIs stay off the public internet path.
        </li>
        <li>
          <LessonEm>Watch:</LessonEm> NAT is an operational component — monitor and size for egress.
        </li>
      </LessonTradeoffs>
    </LessonRoot>
  )
}
