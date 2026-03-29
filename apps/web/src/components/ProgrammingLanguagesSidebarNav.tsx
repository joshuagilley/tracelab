import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  PROGRAMMING_LANGUAGES,
  PROGRAMMING_LANGUAGES_DEFAULT_OPEN,
} from '@/features/programming-languages/programmingLanguagesNav'
import { LanguageLogo } from '@/features/programming-languages/LanguageLogo'
import type { Concept } from '@/types/concept'
import styles from './ProgrammingLanguagesSidebarNav.module.css'

function initialOpenLangs(): Record<string, boolean> {
  const o: Record<string, boolean> = {}
  for (const lang of PROGRAMMING_LANGUAGES) {
    o[lang.id] = false
  }
  for (const id of PROGRAMMING_LANGUAGES_DEFAULT_OPEN) {
    o[id] = true
  }
  return o
}

interface Props {
  concepts: Concept[]
  completedSlugs?: ReadonlySet<string>
}

export default function ProgrammingLanguagesSidebarNav({ concepts, completedSlugs }: Props) {
  const navigate = useNavigate()
  const bySlug = useMemo(() => Object.fromEntries(concepts.map(c => [c.slug, c])), [concepts])
  const [open, setOpen] = useState<Record<string, boolean>>(initialOpenLangs)

  const toggle = (id: string) => {
    setOpen(s => ({ ...s, [id]: !s[id] }))
  }

  return (
    <div className={styles.root}>
      {PROGRAMMING_LANGUAGES.map(lang => {
        const isOpen = open[lang.id] ?? false
        const panelId = `pl-lang-${lang.id}`
        return (
          <div key={lang.id} className={styles.langSection}>
            <button
              type="button"
              className={styles.langHead}
              aria-expanded={isOpen}
              aria-controls={panelId}
              id={`${panelId}-btn`}
              onClick={() => toggle(lang.id)}
            >
              <span className={styles.langChevron} aria-hidden>
                {isOpen ? '▼' : '▶'}
              </span>
              <span className={styles.langTitleRow}>
                <LanguageLogo languageId={lang.id} />
                <span className={styles.langTitle}>{lang.title}</span>
              </span>
            </button>
            {isOpen && (
              <div
                id={panelId}
                role="region"
                aria-labelledby={`${panelId}-btn`}
                className={styles.panel}
              >
                <p className={styles.langBlurb}>{lang.blurb}</p>
                {lang.categories.map(cat => (
                  <div key={`${lang.id}-${cat.id}`} className={styles.category}>
                    <h3 className={styles.categoryTitle}>{cat.title}</h3>
                    <p className={styles.categoryBlurb}>{cat.blurb}</p>
                    <ul className={styles.patternList}>
                      {cat.items.map((item, idx) => {
                        const c = item.slug ? bySlug[item.slug] : undefined
                        const canOpen = c?.status === 'available'
                        const rowDone = !!(item.slug && completedSlugs?.has(item.slug))
                        const rowKey = `${lang.id}-${cat.id}-${idx}-${item.label}`
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
                ))}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
