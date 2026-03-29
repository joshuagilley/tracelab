import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { SYSTEM_DESIGN_SECTIONS } from '@/features/system-design/systemDesignNav'
import type { Concept } from '@/types/concept'
import SectionNavHead from '@/components/sidebar/SectionNavHead'
import styles from '@/components/sidebar/NavSections.module.css'

function initialOpenState(): Record<string, boolean> {
  const o: Record<string, boolean> = {}
  for (const s of SYSTEM_DESIGN_SECTIONS) {
    o[s.id] = false
  }
  return o
}

interface Props {
  concepts: Concept[]
  completedSlugs?: ReadonlySet<string>
}

export default function SystemDesignSidebarNav({ concepts, completedSlugs }: Props) {
  const navigate = useNavigate()
  const bySlug = useMemo(() => Object.fromEntries(concepts.map(c => [c.slug, c])), [concepts])

  const [open, setOpen] = useState<Record<string, boolean>>(initialOpenState)

  const toggle = (id: string) => {
    setOpen(s => ({ ...s, [id]: !s[id] }))
  }

  return (
    <div className={styles.root}>
      {SYSTEM_DESIGN_SECTIONS.map(section => {
        const isOpen = open[section.id] ?? false
        const panelId = `sd-section-${section.id}`
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
