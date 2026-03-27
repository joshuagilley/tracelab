import { useEffect, useRef, useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { fetchConcepts } from '@/features/concepts/api'
import { LAB_OPTIONS, useLab, type LabId } from '@/contexts/lab'
import type { Concept } from '@/types/concept'
import styles from './Sidebar.module.css'

const NAV_ITEMS = [
  { label: 'Concept Library',    icon: '▦', path: '/' },
  { label: 'Scenario Explorer',  icon: '◎', path: '#' },
  { label: 'Systems Analytics',  icon: '▤', path: '#' },
  { label: 'Visual Simulation',  icon: '◈', path: '#' },
  { label: 'Code Editor',        icon: '▧', path: '#' },
]

function BrandGridIcon() {
  const cells = Array.from({ length: 36 }, (_, i) => <span key={i} className={styles.gridDot} />)
  return <div className={styles.brandGrid}>{cells}</div>
}

export default function Sidebar() {
  const [concepts, setConcepts] = useState<Concept[]>([])
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()
  const { labId, setLabId, current } = useLab()

  useEffect(() => {
    fetchConcepts()
      .then(setConcepts)
      .catch(() => setConcepts([]))
  }, [])

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

  return (
    <aside className={styles.sidebar}>
      <div className={styles.brand} ref={menuRef}>
        <div className={styles.brandIcon}>
          <BrandGridIcon />
        </div>
        <div className={styles.brandText}>
          <div className={styles.brandTrace}>TraceLab</div>
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
              {LAB_OPTIONS.map(opt => (
                <li key={opt.id}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={opt.id === labId}
                    className={[styles.labOption, opt.id === labId ? styles.labOptionActive : ''].join(' ')}
                    onClick={() => selectLab(opt.id)}
                  >
                    {opt.label}
                  </button>
                </li>
              ))}
            </ul>
          )}
          <div className={styles.brandVersion}>V2.4.0 OBSIDIAN</div>
        </div>
      </div>

      <nav className={styles.nav}>
        {NAV_ITEMS.map(item => (
          <NavLink
            key={item.label}
            to={item.path}
            end={item.path === '/'}
            className={({ isActive }) =>
              [styles.navItem, isActive && item.path !== '#' ? styles.navItemActive : ''].join(' ')
            }
            onClick={e => {
              if (item.path === '#') e.preventDefault()
            }}
          >
            <span className={styles.navIcon}>{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className={styles.section}>
        <div className={styles.sectionTitle}>SYSTEM COMPONENTS</div>
        <div className={styles.conceptList}>
          {concepts.map(c => (
            <button
              key={c.id}
              className={styles.conceptItem}
              onClick={() => {
                if (c.status === 'available') navigate(`/concept/${c.slug}`)
              }}
              disabled={c.status !== 'available'}
            >
              <div className={styles.conceptTop}>
                <span className={styles.conceptTitle}>{c.title}</span>
                <span className={`badge badge--${c.difficulty}`}>{c.difficulty}</span>
              </div>
              <div className={styles.conceptSummary}>{c.summary}</div>
            </button>
          ))}
        </div>
      </div>

      <button
        className={styles.newButton}
        onClick={() => navigate('/')}
      >
        NEW SYSTEM DESIGN
      </button>
    </aside>
  )
}
