import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCurriculumVisibility } from '@/contexts/curriculumVisibility'
import { LanguageLogo } from '@/components/programming-languages/LanguageLogo'
import { countSectionNavProgress } from '@/features/learning/progress/nav-section-progress'
import { filterProgrammingLanguages } from '@/lib/nav-curriculum-filter'
import type { Concept } from '@/types/concept'
import type { ProgrammingLanguage } from '@/types/programming-language'
import styles from '@/components/sidebar/ProgrammingLanguagesSidebarNav.module.css'

function buildInitialOpen(langs: ProgrammingLanguage[], defaultOpen: string[] | undefined) {
  const o: Record<string, boolean> = {}
  for (const lang of langs) {
    o[lang.id] = false
  }
  for (const id of defaultOpen ?? []) {
    o[id] = true
  }
  return o
}

interface Props {
  concepts: Concept[]
  completedSlugs?: ReadonlySet<string>
  languages: ProgrammingLanguage[]
  defaultOpenSectionIds?: string[]
}

export default function ProgrammingLanguagesSidebarNav({
  concepts,
  completedSlugs,
  languages,
  defaultOpenSectionIds,
}: Props) {
  const navigate = useNavigate()
  const { publishedOnly } = useCurriculumVisibility()
  const bySlug = useMemo(() => Object.fromEntries(concepts.map(c => [c.slug, c])), [concepts])
  const visibleLangs = useMemo(
    () => filterProgrammingLanguages(languages, bySlug, publishedOnly),
    [languages, bySlug, publishedOnly],
  )
  const [open, setOpen] = useState<Record<string, boolean>>(() =>
    buildInitialOpen(languages, defaultOpenSectionIds),
  )

  useEffect(() => {
    setOpen(buildInitialOpen(languages, defaultOpenSectionIds))
  }, [languages, defaultOpenSectionIds])

  const toggle = (id: string) => {
    setOpen(s => ({ ...s, [id]: !s[id] }))
  }

  if (visibleLangs.length === 0) {
    return (
      <p className={styles.filterEmpty} role="status">
        No published topics in this library yet.
      </p>
    )
  }

  return (
    <div className={styles.root}>
      {visibleLangs.map(lang => {
        const isOpen = open[lang.id] ?? false
        const panelId = `pl-lang-${lang.id}`
        const flatItems = lang.categories.flatMap(c => c.items)
        const { done, total } = countSectionNavProgress(flatItems, bySlug, completedSlugs)
        const pct = total > 0 ? Math.round((done / total) * 100) : 0
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
              <div className={styles.langHeadTop}>
                <span className={styles.langChevron} aria-hidden>
                  {isOpen ? '▼' : '▶'}
                </span>
                <span className={styles.langTitleRow}>
                  <LanguageLogo languageId={lang.id} />
                  <span className={styles.langTitle}>{lang.title}</span>
                </span>
                {total > 0 && (
                  <span className={styles.langStat} title={`${pct}% complete for ${lang.title}`}>
                    {done}/{total}
                  </span>
                )}
              </div>
              {total > 0 && (
                <div
                  className={styles.langProgressTrack}
                  role="progressbar"
                  aria-valuenow={done}
                  aria-valuemin={0}
                  aria-valuemax={total}
                  aria-label={`${done} of ${total} topics complete in ${lang.title}`}
                >
                  <div className={styles.langProgressFill} style={{ width: `${pct}%` }} />
                </div>
              )}
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
