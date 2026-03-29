import {
  LessonRoot,
  LessonProblem,
  LessonDiagram,
  LessonTradeoffs,
  LessonEm,
} from '@/components/lesson-panels/LessonPanel'

export default function ObjectStorageS3Lesson({ summary }: { summary: string }) {
  return (
    <LessonRoot>
      <LessonProblem>{summary}</LessonProblem>
      <LessonDiagram label="Access path">
        <svg width="280" height="90" viewBox="0 0 280 90" aria-label="application role accessing private bucket">
          <text x="50" y="50" textAnchor="middle" fill="var(--text-secondary)" fontSize="9">
            App role
          </text>
          <rect x="120" y="28" width="100" height="40" rx="6" fill="var(--bg-base)" stroke="var(--accent)" />
          <text x="170" y="52" textAnchor="middle" fill="var(--text-primary)" fontSize="9" fontWeight="600">
            Bucket
          </text>
          <text x="170" y="68" textAnchor="middle" fill="var(--text-muted)" fontSize="7">
            private
          </text>
          <path d="M 100 48 L 118 48" stroke="var(--accent)" strokeWidth="1.5" />
        </svg>
      </LessonDiagram>
      <LessonTradeoffs>
        <li>
          <LessonEm>Win:</LessonEm> IAM-scoped access, versioning, lifecycle — no servers to patch for static assets.
        </li>
        <li>
          <LessonEm>Risk:</LessonEm> one overly broad bucket policy can expose the world — review policies like code.
        </li>
      </LessonTradeoffs>
    </LessonRoot>
  )
}
