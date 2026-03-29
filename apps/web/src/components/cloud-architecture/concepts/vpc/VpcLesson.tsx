import {
  LessonRoot,
  LessonProblem,
  LessonDiagram,
  LessonTradeoffs,
  LessonBottomNote,
  LessonEm,
} from '@/components/lesson-panels/LessonPanel'

export default function VpcLesson({ summary }: { summary: string }) {
  return (
    <LessonRoot>
      <LessonProblem>{summary}</LessonProblem>
      <LessonDiagram label="Network boundary">
        <svg width="300" height="140" viewBox="0 0 300 140" aria-label="VPC with public and private subnets">
          <rect x="10" y="10" width="280" height="120" rx="8" fill="var(--bg-base)" stroke="var(--accent)" strokeWidth="1.5" />
          <text x="150" y="28" textAnchor="middle" fill="var(--text-primary)" fontSize="11" fontWeight="600">
            VPC 10.0.0.0/16
          </text>
          <rect x="24" y="42" width="118" height="36" rx="4" fill="var(--bg-subtle)" stroke="var(--border)" />
          <text x="83" y="64" textAnchor="middle" fill="var(--text-secondary)" fontSize="9">
            public subnets
          </text>
          <rect x="158" y="42" width="118" height="78" rx="4" fill="var(--bg-subtle)" stroke="var(--border)" />
          <text x="217" y="62" textAnchor="middle" fill="var(--text-secondary)" fontSize="9">
            private subnets
          </text>
          <text x="217" y="78" textAnchor="middle" fill="var(--text-muted)" fontSize="8">
            app + db tiers
          </text>
          <text x="150" y="8" textAnchor="middle" fill="var(--text-muted)" fontSize="7">
            Internet → IGW → public subnets
          </text>
        </svg>
      </LessonDiagram>
      <LessonTradeoffs>
        <li>
          <LessonEm>Win:</LessonEm> clear blast-radius boundaries and route tables per tier.
        </li>
        <li>
          <LessonEm>Cost:</LessonEm> NAT gateways and more subnets to manage — worth it for anything serious.
        </li>
      </LessonTradeoffs>
      <LessonBottomNote>Compare present vs bad in the code panel for flat vs segmented layouts.</LessonBottomNote>
    </LessonRoot>
  )
}
