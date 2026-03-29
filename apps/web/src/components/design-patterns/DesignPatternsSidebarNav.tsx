import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { DESIGN_PATTERN_SECTIONS } from '@/features/design-patterns/designPatternNav'
import type { Concept } from '@/types/concept'
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
  const bySlug = useMemo(() => Object.fromEntries(concepts.map(c => [c.slug, c])), [concepts])

  const [open, setOpen] = useState<Record<string, boolean>>(() => initialPatternOpenState())

  const toggle = (id: string) => {
    setOpen(s => ({ ...s, [id]: !s[id] }))
  }

  return (
    <div className={styles.root}>
      {DESIGN_PATTERN_SECTIONS.map(section => {
        const isOpen = open[section.id] ?? false
        const panelId = `dp-section-${section.id}`
        return (
          <div key={section.id} className={styles.section}>
            <button
              type="button"
              className={styles.sectionHead}
              aria-expanded={isOpen}
              aria-controls={panelId}
              id={`${panelId}-btn`}
              onClick={() => toggle(section.id)}
            >
              <span className={styles.sectionChevron} aria-hidden>
                {isOpen ? '▼' : '▶'}
              </span>
              <span className={styles.sectionTitle}>{section.title}</span>
            </button>
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
