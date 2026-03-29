import { LessonPlaceholder } from '@/components/lesson-panels/LessonPanel'
import PrimaryKeysForeignKeysLesson from './concepts/primary-keys-foreign-keys/PrimaryKeysForeignKeysLesson'

interface Props {
  summary: string
  slug: string
}

export default function DatabaseDesignLessonPanel({ summary, slug }: Props) {
  if (slug === 'primary-keys-foreign-keys') return <PrimaryKeysForeignKeysLesson summary={summary} />
  return <LessonPlaceholder summary={summary} />
}
