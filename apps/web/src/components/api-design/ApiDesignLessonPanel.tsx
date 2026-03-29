import { LessonPlaceholder } from '@/components/lesson-panels/LessonPanel'
import RateLimitingLesson from './concepts/rate-limiting/RateLimitingLesson'
import RetriesLesson from './concepts/retries/RetriesLesson'
import CircuitBreakerLesson from './concepts/circuit-breaker/CircuitBreakerLesson'

interface Props {
  summary: string
  slug: string
}

export default function ApiDesignLessonPanel({ summary, slug }: Props) {
  if (slug === 'rate-limiting') return <RateLimitingLesson summary={summary} />
  if (slug === 'retries') return <RetriesLesson summary={summary} />
  if (slug === 'circuit-breaker') return <CircuitBreakerLesson summary={summary} />
  return <LessonPlaceholder summary={summary} />
}
