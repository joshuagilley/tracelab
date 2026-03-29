import { LessonPlaceholder } from '@/components/lesson-panels/LessonPanel'
import PointersLesson from './concepts/pointers/PointersLesson'

interface Props {
  summary: string
  slug: string
}

export default function LowLevelSystemsLessonPanel({ summary, slug }: Props) {
  if (slug === 'pointers') return <PointersLesson summary={summary} />
  return <LessonPlaceholder summary={summary} />
}
