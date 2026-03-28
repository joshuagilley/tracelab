import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CLOUD_ARCHITECTURE_SECTIONS } from '@/features/cloud-architecture/cloudArchitectureNav'
import type { Concept } from '@/types/concept'
import styles from './DesignPatternsSidebarNav.module.css'

function initialOpenState(): Record<string, boolean> {
  const o: Record<string, boolean> = {}
  for (const s of CLOUD_ARCHITECTURE_SECTIONS) {
    o[s.id] = false
  }
  return o
}

interface Props {
  concepts: Concept[]
}

export default function CloudArchitectureSidebarNav({ concepts }: Props) {
  const navigate = useNavigate()
  const bySlug = useMemo(() => Object.fromEntries(concepts.map(c => [c.slug, c])), [concepts])

  const [open, setOpen] = useState<Record<string, boolean>>(initialOpenState)

  const toggle = (id: string) => {
    setOpen(s => ({ ...s, [id]: !s[id] }))
  }

  return (
    <div className={styles.root}>
      {CLOUD_ARCHITECTURE_SECTIONS.map(section => {
        const isOpen = open[section.id] ?? false
        const panelId = `ca-section-${section.id}`
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
                  {section.items.map((item, idx) => {
                    const c = item.slug ? bySlug[item.slug] : undefined
                    const canOpen = c?.status === 'available'
                    const rowKey = `${section.id}-${idx}-${item.label}`
                    return (
                      <li key={rowKey}>
                        <button
                          type="button"
                          className={styles.patternRow}
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
