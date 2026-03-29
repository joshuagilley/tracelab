import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCurriculumVisibility } from '@/contexts/curriculumVisibility'
import { filterCurriculumSections } from '@/lib/navCurriculumFilter'
import type { CurriculumNavSection } from '@/types/curriculumNav'
import type { Concept } from '@/types/concept'
import SectionNavHead from '@/components/sidebar/SectionNavHead'
import styles from './NavSections.module.css'

function buildInitialOpen(
  sections: CurriculumNavSection[],
  defaultOpenSectionIds?: string[],
): Record<string, boolean> {
  const o: Record<string, boolean> = {}
  for (const s of sections) {
    o[s.id] = false
  }
  const openIds = defaultOpenSectionIds?.filter(Boolean) ?? []
  for (const id of openIds) {
    o[id] = true
  }
  return o
}

export interface TopicSidebarNavProps {
  concepts: Concept[]
  sections: CurriculumNavSection[]
  /** Prefix for stable DOM ids, e.g. "net", "sec" */
  panelPrefix: string
  /** Which accordion sections start expanded (default: none) */
  defaultOpenSectionIds?: string[]
  /** Concept slugs where every lesson section is marked done */
  completedSlugs?: ReadonlySet<string>
}

export default function TopicSidebarNav({
  concepts,
  sections,
  panelPrefix,
  defaultOpenSectionIds,
  completedSlugs,
}: TopicSidebarNavProps) {
  const navigate = useNavigate()
  const { publishedOnly } = useCurriculumVisibility()
  const bySlug = useMemo(() => Object.fromEntries(concepts.map(c => [c.slug, c])), [concepts])
  const visibleSections = useMemo(
    () => filterCurriculumSections(sections, bySlug, publishedOnly),
    [sections, bySlug, publishedOnly],
  )

  const [open, setOpen] = useState<Record<string, boolean>>(() =>
    buildInitialOpen(sections, defaultOpenSectionIds),
  )

  const toggle = (id: string) => {
    setOpen(s => ({ ...s, [id]: !s[id] }))
  }

  if (visibleSections.length === 0) {
    return (
      <p className={styles.filterEmpty} role="status">
        No published topics in this library yet.
      </p>
    )
  }

  return (
    <div className={styles.root}>
      {visibleSections.map(section => {
        const isOpen = open[section.id] ?? false
        const panelId = `${panelPrefix}-section-${section.id}`
        return (
          <div key={section.id} className={styles.section}>
            <SectionNavHead
              isOpen={isOpen}
              panelId={panelId}
              title={section.title}
              items={section.items}
              bySlug={bySlug}
              completedSlugs={completedSlugs}
              onToggle={() => toggle(section.id)}
            />
            {isOpen && (
              <div
                id={panelId}
                role="region"
                aria-labelledby={`${panelId}-btn`}
                className={styles.panel}
              >
                <p className={styles.blurb}>{section.blurb}</p>
                <ul className={styles.patternList}>
                  {section.items.map((item, idx) => {
                    const c = item.slug ? bySlug[item.slug] : undefined
                    const canOpen = c?.status === 'available'
                    const rowDone = !!(item.slug && completedSlugs?.has(item.slug))
                    const rowKey = `${section.id}-${idx}-${item.label}`
                    return (
                      <li key={rowKey}>
                        <button
                          type="button"
                          className={[styles.patternRow, rowDone ? styles.patternRowComplete : ''].join(' ')}
                          disabled={!canOpen}
                          onClick={() => {
                            if (item.slug && canOpen) navigate(`/concept/${item.slug}`)
                          }}
                        >
                          <span className={styles.patternLabel}>{item.label}</span>
                          {canOpen && c ? (
                            <span className={`badge badge--${c.difficulty} ${styles.patternBadge}`}>
                              {c.difficulty}
                            </span>
                          ) : (
                            <span className={styles.soon}>Soon</span>
                          )}
                        </button>
                      </li>
                    )
                  })}
                </ul>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
