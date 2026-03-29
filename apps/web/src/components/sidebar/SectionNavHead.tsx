import { useMemo } from 'react'
import { countSectionNavProgress, type NavSlugItem } from '@/features/concepts/navSectionProgress'
import type { Concept } from '@/types/concept'
import styles from './NavSections.module.css'

interface Props {
  isOpen: boolean
  panelId: string
  title: string
  items: NavSlugItem[]
  bySlug: Record<string, Concept | undefined>
  completedSlugs?: ReadonlySet<string>
  onToggle: () => void
}

export default function SectionNavHead({
  isOpen,
  panelId,
  title,
  items,
  bySlug,
  completedSlugs,
  onToggle,
}: Props) {
  const { done, total } = useMemo(
    () => countSectionNavProgress(items, bySlug, completedSlugs),
    [items, bySlug, completedSlugs],
  )
  const pct = total > 0 ? Math.round((done / total) * 100) : 0

  return (
    <button
      type="button"
      className={styles.sectionHead}
      aria-expanded={isOpen}
      aria-controls={panelId}
      id={`${panelId}-btn`}
      onClick={onToggle}
    >
      <div className={styles.sectionHeadMain}>
        <span className={styles.sectionChevron} aria-hidden>
          {isOpen ? '▼' : '▶'}
        </span>
        <span className={styles.sectionTitle}>{title}</span>
        {total > 0 && (
          <span className={styles.sectionStat} title={`${pct}% complete in this section`}>
            {done}/{total}
          </span>
        )}
      </div>
      {total > 0 && (
        <div
          className={styles.sectionProgressTrack}
          role="progressbar"
          aria-valuenow={done}
          aria-valuemin={0}
          aria-valuemax={total}
          aria-label={`${done} of ${total} topics complete in ${title}`}
        >
          <div className={styles.sectionProgressFill} style={{ width: `${pct}%` }} />
        </div>
      )}
    </button>
  )
}
