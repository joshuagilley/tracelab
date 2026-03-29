import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCurriculumVisibility } from '@/contexts/curriculumVisibility'
import { filterCurriculumSections } from '@/lib/navCurriculumFilter'
import { DESIGN_PATTERN_SECTIONS } from '@/features/design-patterns/designPatternNav'
import type { Concept } from '@/types/concept'
import SectionNavHead from '@/components/sidebar/SectionNavHead'
import styles from '@/components/sidebar/NavSections.module.css'

function initialPatternOpenState(): Record<string, boolean> {
  const o: Record<string, boolean> = {}
  for (const s of DESIGN_PATTERN_SECTIONS) {
    o[s.id] = false
  }
  return o
}

interface Props {
  concepts: Concept[]
  completedSlugs?: ReadonlySet<string>
}

export default function DesignPatternsSidebarNav({ concepts, completedSlugs }: Props) {
  const navigate = useNavigate()
  const { publishedOnly } = useCurriculumVisibility()
  const bySlug = useMemo(() => Object.fromEntries(concepts.map(c => [c.slug, c])), [concepts])
  const visibleSections = useMemo(
    () => filterCurriculumSections(DESIGN_PATTERN_SECTIONS, bySlug, publishedOnly),
    [bySlug, publishedOnly],
  )

  const [open, setOpen] = useState<Record<string, boolean>>(() => initialPatternOpenState())

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
        const panelId = `dp-section-${section.id}`
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
                  {section.items.map(item => {
                    const c = item.slug ? bySlug[item.slug] : undefined
                    const canOpen = c?.status === 'available'
                    const rowDone = !!(item.slug && completedSlugs?.has(item.slug))
                    return (
                      <li key={item.label}>
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
