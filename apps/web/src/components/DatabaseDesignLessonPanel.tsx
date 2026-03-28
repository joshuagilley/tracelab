import { useId } from 'react'
import styles from './DatabaseDesignLessonPanel.module.css'

interface Props {
  summary: string
  slug: string
}

/** Minimal diagram + tradeoffs for database-design lessons (expand per slug later). */
export default function DatabaseDesignLessonPanel({ summary, slug }: Props) {
  const markerId = useId().replace(/:/g, '')

  if (slug === 'primary-keys-foreign-keys') {
    return (
      <div className={styles.wrap}>
        <p className={styles.problem}>{summary}</p>
        <div className={styles.diagramCard}>
          <span className={styles.diagramLabel}>Data shape</span>
          <div className={styles.diagramBody}>
            <svg width="280" height="120" viewBox="0 0 280 120" aria-label="users and orders tables linked by foreign key">
              <rect x="8" y="20" width="100" height="72" rx="6" fill="var(--bg-base)" stroke="var(--accent)" strokeWidth="1.5" />
              <text x="58" y="44" textAnchor="middle" fill="var(--text-primary)" fontSize="11" fontWeight="600">
                users
              </text>
              <text x="58" y="62" textAnchor="middle" fill="var(--text-muted)" fontSize="9">
                PK id
              </text>
              <text x="58" y="78" textAnchor="middle" fill="var(--text-muted)" fontSize="9">
                email, name…
              </text>
              <rect x="172" y="20" width="100" height="72" rx="6" fill="var(--bg-base)" stroke="var(--accent)" strokeWidth="1.5" />
              <text x="222" y="44" textAnchor="middle" fill="var(--text-primary)" fontSize="11" fontWeight="600">
                orders
              </text>
              <text x="222" y="62" textAnchor="middle" fill="var(--text-muted)" fontSize="9">
                PK id, FK user_id
              </text>
              <text x="222" y="78" textAnchor="middle" fill="var(--text-muted)" fontSize="9">
                total_cents…
              </text>
              <path
                d="M 108 56 L 172 56"
                stroke="var(--accent)"
                strokeWidth="1.5"
                fill="none"
                markerEnd={`url(#${markerId}-dbd-arrow)`}
              />
              <defs>
                <marker
                  id={`${markerId}-dbd-arrow`}
                  markerWidth="8"
                  markerHeight="8"
                  refX="6"
                  refY="4"
                  orient="auto"
                >
                  <path d="M0,0 L8,4 L0,8 Z" fill="var(--accent)" />
                </marker>
              </defs>
              <text x="140" y="48" textAnchor="middle" fill="var(--accent)" fontSize="8" fontFamily="var(--font-mono)">
                FK
              </text>
            </svg>
          </div>
        </div>
        <div className={styles.tradeoffs}>
          <p className={styles.tradeoffsTitle}>Tradeoffs</p>
          <ul>
            <li>
              <span className={styles.em}>Good:</span> one place to update a user; database can enforce that every order
              belongs to a real user.
            </li>
            <li>
              <span className={styles.em}>Cost:</span> fetching an order + user usually needs a join or two queries —
              indexes on FK columns keep that cheap.
            </li>
          </ul>
        </div>
        <p className={styles.bottomNote}>Compare the code panel: present schema vs duplicated “convenient” columns.</p>
      </div>
    )
  }

  return (
    <div className={styles.wrap}>
      <p className={styles.problem}>{summary}</p>
      <div className={styles.diagramCard}>
        <span className={styles.diagramLabel}>Diagram</span>
        <div className={styles.diagramBody}>
          <p className={styles.bottomNote}>Visual for this topic is not wired yet.</p>
        </div>
      </div>
    </div>
  )
}
