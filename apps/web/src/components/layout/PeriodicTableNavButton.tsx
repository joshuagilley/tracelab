import { NavLink } from 'react-router-dom'
import styles from './PeriodicTableNavButton.module.css'

export default function PeriodicTableNavButton() {
  return (
    <NavLink
      to="/cs-periodic-table"
      data-tour="periodic-table"
      className={({ isActive }) =>
        [styles.link, isActive ? styles.linkActive : ''].join(' ')
      }
      title="Curriculum map — all topics by library (periodic table)"
      aria-label="Open curriculum periodic table"
    >
      <span className={styles.grid} aria-hidden>
        {Array.from({ length: 9 }, (_, i) => (
          <span key={i} className={styles.cell} />
        ))}
      </span>
    </NavLink>
  )
}
