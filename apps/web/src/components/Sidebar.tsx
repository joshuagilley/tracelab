import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { NavLink } from 'react-router-dom'
import { useLabCurriculumProgress } from '@/contexts/labCurriculumProgress'
import { useCurriculumVisibility } from '@/contexts/curriculumVisibility'
import { LAB_GROUPS, useLab, type LabId } from '@/contexts/lab'
import {
  filterLabGroupsForPublishedOnly,
  firstPublishedLabId,
  labHasPublishedConcepts,
} from '@/lib/labPickerFilter'
import CurriculumTopicPane from './CurriculumTopicPane'
import DesignPatternsSidebarNav from './design-patterns/DesignPatternsSidebarNav'
import SystemDesignSidebarNav from './system-design/SystemDesignSidebarNav'
import DataScienceSidebarNav from './data-science/DataScienceSidebarNav'
import DatabaseDesignSidebarNav from './database-design/DatabaseDesignSidebarNav'
import CloudArchitectureSidebarNav from './cloud-architecture/CloudArchitectureSidebarNav'
import ApiDesignSidebarNav from './api-design/ApiDesignSidebarNav'
import ProgrammingLanguagesSidebarNav from './programming-languages/ProgrammingLanguagesSidebarNav'
import styles from './Sidebar.module.css'

const LIBRARY_LINK_LABEL: Record<LabId, string> = {
  'system-design': 'System design',
  'api-design': 'All APIs',
  concurrency: 'All topics',
  networking: 'All topics',
  security: 'All topics',
  'software-architecture': 'All topics',
  testing: 'All topics',
  devops: 'All topics',
  'low-level-systems': 'All topics',
  'operating-systems': 'All topics',
  algorithms: 'All topics',
  'ai-systems': 'All topics',
  'programming-languages': 'All topics',
  'design-patterns': 'All patterns',
  'data-science': 'All topics',
  'database-design': 'All lessons',
  'cloud-architecture': 'All lessons',
}

/** Accordion curriculum driven by `TopicSidebarNav` + feature nav files */
const TOPIC_CURRICULUM_IDS = new Set<LabId>([
  'concurrency',
  'networking',
  'security',
  'software-architecture',
  'testing',
  'devops',
  'low-level-systems',
  'operating-systems',
  'algorithms',
  'ai-systems',
])

function BrandGridIcon() {
  const cells = Array.from({ length: 36 }, (_, i) => (
    <span key={i} className={styles.gridDot} />
  ))
  return <div className={styles.brandGrid}>{cells}</div>
}

export default function Sidebar() {
  const { publishedOnly, setPublishedOnly } = useCurriculumVisibility()
  const { concepts, completedSlugs, labTotals } = useLabCurriculumProgress()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const { labId, setLabId, current } = useLab()

  const visibleLabGroups = useMemo(
    () => (publishedOnly ? filterLabGroupsForPublishedOnly(LAB_GROUPS) : LAB_GROUPS),
    [publishedOnly],
  )

  useEffect(() => {
    if (!publishedOnly) return
    if (labHasPublishedConcepts(labId)) return
    const next = firstPublishedLabId(LAB_GROUPS)
    if (next && next !== labId) setLabId(next)
  }, [publishedOnly, labId, setLabId])

  useEffect(() => {
    if (!menuOpen) return
    const onDoc = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [menuOpen])

  const selectLab = (id: LabId) => {
    setLabId(id)
    setMenuOpen(false)
  }

  let topicNav: ReactNode = null
  if (labId === 'design-patterns') {
    topicNav = <DesignPatternsSidebarNav concepts={concepts} completedSlugs={completedSlugs} />
  } else if (labId === 'system-design') {
    topicNav = <SystemDesignSidebarNav concepts={concepts} completedSlugs={completedSlugs} />
  } else if (labId === 'api-design') {
    topicNav = <ApiDesignSidebarNav concepts={concepts} completedSlugs={completedSlugs} />
  } else if (TOPIC_CURRICULUM_IDS.has(labId)) {
    topicNav = (
      <CurriculumTopicPane labId={labId} concepts={concepts} completedSlugs={completedSlugs} />
    )
  } else if (labId === 'data-science') {
    topicNav = <DataScienceSidebarNav concepts={concepts} completedSlugs={completedSlugs} />
  } else if (labId === 'database-design') {
    topicNav = <DatabaseDesignSidebarNav concepts={concepts} completedSlugs={completedSlugs} />
  } else if (labId === 'cloud-architecture') {
    topicNav = <CloudArchitectureSidebarNav concepts={concepts} completedSlugs={completedSlugs} />
  } else if (labId === 'programming-languages') {
    topicNav = <ProgrammingLanguagesSidebarNav concepts={concepts} completedSlugs={completedSlugs} />
  }

  const sidebarSectionLabel =
    labId === 'design-patterns' ? 'BY CATEGORY'
    : labId === 'programming-languages' ? 'BY LANGUAGE'
    : 'BY TOPIC'

  const { completed: labDone, total: labTotal } = labTotals
  const labPct = labTotal > 0 ? Math.round((labDone / labTotal) * 100) : 0

  return (
    <aside className={styles.sidebar}>
      <div className={styles.brand} ref={menuRef}>
        <div className={styles.brandIcon}>
          <BrandGridIcon />
        </div>
        <div className={styles.brandText}>
          <div className={styles.brandTrace}>TraceLab</div>
          <div className={styles.brandPickerBlock}>
            <button
              type="button"
              className={styles.labTrigger}
              onClick={() => setMenuOpen(o => !o)}
              aria-expanded={menuOpen}
              aria-haspopup="listbox"
            >
              <span className={styles.labLabel}>{current.label}</span>
              <span className={[styles.chevron, menuOpen ? styles.chevronOpen : ''].join(' ')} aria-hidden>
                ▼
              </span>
            </button>
            {menuOpen && (
              <ul className={styles.labMenu} role="listbox">
                {visibleLabGroups.length === 0 ? (
                  <li className={styles.labMenuEmpty} role="presentation">
                    No libraries with published lessons yet.
                  </li>
                ) : (
                  visibleLabGroups.map(group => (
                    <li key={group.heading} className={styles.labMenuGroup}>
                      <div className={styles.labMenuHeading} role="presentation">
                        {group.heading}
                      </div>
                      <ul className={styles.labMenuSublist}>
                        {group.options.map(opt => (
                          <li key={opt.id}>
                            <button
                              type="button"
                              role="option"
                              aria-selected={opt.id === labId}
                              className={[
                                styles.labOption,
                                opt.id === labId ? styles.labOptionActive : '',
                              ].join(' ')}
                              onClick={() => selectLab(opt.id)}
                            >
                              {opt.label}
                            </button>
                          </li>
                        ))}
                      </ul>
                    </li>
                  ))
                )}
              </ul>
            )}
          </div>
          {labTotal > 0 && (
            <div
              className={styles.labProgressWrap}
              title={`${labDone} of ${labTotal} published topics marked done in ${current.label}`}
            >
              <div className={styles.labProgressRow}>
                <span className={styles.labProgressCaption}>Library progress</span>
                <span className={styles.labProgressStat}>
                  {labDone}/{labTotal}
                </span>
              </div>
              <div
                className={styles.labProgressTrack}
                role="progressbar"
                aria-valuenow={labDone}
                aria-valuemin={0}
                aria-valuemax={labTotal}
                aria-label={`${labDone} of ${labTotal} topics complete in ${current.label}`}
              >
                <div className={styles.labProgressFill} style={{ width: `${labPct}%` }} />
              </div>
            </div>
          )}
          <div
            className={styles.curriculumToggleWrap}
            title="Hide upcoming topics and libraries with no published lessons yet (sidebar + lab menu + library grid)"
          >
            <span className={styles.curriculumToggleLabel} id="curriculum-published-only-label">
              Published only
            </span>
            <button
              type="button"
              role="switch"
              aria-checked={publishedOnly}
              aria-labelledby="curriculum-published-only-label"
              className={[styles.curriculumSwitch, publishedOnly ? styles.curriculumSwitchOn : ''].join(' ')}
              onClick={() => setPublishedOnly(!publishedOnly)}
            >
              <span className={styles.curriculumSwitchThumb} aria-hidden />
            </button>
          </div>
        </div>
      </div>

      <nav className={styles.quickNav} aria-label="Library">
        <NavLink
          to="/"
          end
          className={({ isActive }) =>
            [styles.libLink, isActive ? styles.libLinkActive : ''].join(' ')
          }
        >
          {LIBRARY_LINK_LABEL[labId]}
        </NavLink>
      </nav>

      <div className={styles.section}>
        <div className={styles.sectionTitle}>{sidebarSectionLabel}</div>
        {topicNav}
      </div>
    </aside>
  )
}
