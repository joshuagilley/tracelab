import { useEffect, useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { fetchConcepts } from '@/features/concepts/api'
import type { Concept } from '@/types/concept'
import styles from './Sidebar.module.css'

const NAV_ITEMS = [
  { label: 'Concept Library',    icon: '▦', path: '/' },
  { label: 'Scenario Explorer',  icon: '◎', path: '#' },
  { label: 'Systems Analytics',  icon: '▤', path: '#' },
  { label: 'Visual Simulation',  icon: '◈', path: '#' },
  { label: 'Code Editor',        icon: '▧', path: '#' },
]

export default function Sidebar() {
  const [concepts, setConcepts] = useState<Concept[]>([])
  const navigate = useNavigate()

  useEffect(() => {
    fetchConcepts()
      .then(setConcepts)
      .catch(() => setConcepts([]))
  }, [])

  return (
    <aside className={styles.sidebar}>
      <div className={styles.brand}>
        <div className={styles.brandIcon}>▦</div>
        <div>
          <div className={styles.brandName}>TraceLab</div>
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
