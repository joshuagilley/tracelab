import { type ReactNode } from 'react'
import styles from './ApiDesignLessonPanel.module.css'

interface Props {
  summary: string
  slug: string
}

function Tradeoffs({ children }: { children: ReactNode }) {
  return (
    <div className={styles.tradeoffs}>
      <p className={styles.tradeoffsTitle}>Tradeoffs</p>
      <ul>{children}</ul>
    </div>
  )
}

export default function ApiDesignLessonPanel({ summary, slug }: Props) {
  const base = <p className={styles.problem}>{summary}</p>

  if (slug === 'rate-limiting') {
    return (
      <div className={styles.wrap}>
        {base}
        <div className={styles.diagramCard}>
          <span className={styles.diagramLabel}>Request flow</span>
          <div className={styles.diagramBody}>
            <svg width="300" height="100" viewBox="0 0 300 100" aria-label="client through limiter to API">
              <text x="40" y="52" textAnchor="middle" fill="var(--text-secondary)" fontSize="9">
                Client
              </text>
              <rect x="85" y="30" width="70" height="40" rx="6" fill="var(--bg-base)" stroke="var(--accent)" />
              <text x="120" y="54" textAnchor="middle" fill="var(--text-primary)" fontSize="9" fontWeight="600">
                Limiter
              </text>
              <text x="250" y="52" textAnchor="middle" fill="var(--text-secondary)" fontSize="9">
                Your API
              </text>
              <path d="M 65 50 L 83 50" stroke="var(--accent)" strokeWidth="1.5" />
              <path d="M 157 50 L 215 50" stroke="var(--accent)" strokeWidth="1.5" />
              <text x="120" y="88" textAnchor="middle" fill="var(--text-muted)" fontSize="8">
                over quota → 429 + Retry-After
              </text>
            </svg>
          </div>
        </div>
        <Tradeoffs>
          <li>
            <span className={styles.em}>Win:</span> fair usage, abuse containment, predictable load on workers.
          </li>
          <li>
            <span className={styles.em}>Design:</span> identify clients (key vs IP), document limits in OpenAPI, return
            429 not 500.
          </li>
        </Tradeoffs>
        <p className={styles.bottomNote}>System Design picks queues and topology; here we shape the HTTP contract.</p>
      </div>
    )
  }

  if (slug === 'retries') {
    return (
      <div className={styles.wrap}>
        {base}
        <div className={styles.diagramCard}>
          <span className={styles.diagramLabel}>Client retry spacing</span>
          <div className={styles.diagramBody}>
            <svg width="280" height="90" viewBox="0 0 280 90" aria-label="exponential backoff timeline">
              <text x="30" y="48" fill="var(--text-muted)" fontSize="9">
                t0
              </text>
              <text x="100" y="48" fill="var(--text-muted)" fontSize="9">
                t1
              </text>
              <text x="180" y="48" fill="var(--text-muted)" fontSize="9">
                t2
              </text>
              <text x="250" y="48" fill="var(--text-muted)" fontSize="9">
                t3
              </text>
              <path d="M 20 60 L 260 60" stroke="var(--border)" strokeWidth="1" />
              <circle cx="30" cy="60" r="4" fill="var(--accent)" />
              <circle cx="100" cy="60" r="4" fill="var(--accent)" />
              <circle cx="180" cy="60" r="4" fill="var(--accent)" />
              <text x="140" y="22" textAnchor="middle" fill="var(--text-secondary)" fontSize="9">
                increasing gaps + jitter
              </text>
            </svg>
          </div>
        </div>
        <Tradeoffs>
          <li>
            <span className={styles.em}>Win:</span> transient blips recover without operator paging.
          </li>
          <li>
            <span className={styles.em}>Risk:</span> synchronized retries amplify outages — always jitter and cap
            attempts.
          </li>
        </Tradeoffs>
      </div>
    )
  }

  if (slug === 'circuit-breaker') {
    return (
      <div className={styles.wrap}>
        {base}
        <div className={styles.diagramCard}>
          <span className={styles.diagramLabel}>Caller protection</span>
          <div className={styles.diagramBody}>
            <svg width="300" height="100" viewBox="0 0 300 100" aria-label="circuit open blocks calls to failing service">
              <text x="50" y="55" textAnchor="middle" fill="var(--text-secondary)" fontSize="9">
                API
              </text>
              <rect x="100" y="32" width="60" height="36" rx="6" fill="var(--bg-base)" stroke="var(--accent)" />
              <text x="130" y="54" textAnchor="middle" fill="var(--text-primary)" fontSize="8" fontWeight="600">
                CB
              </text>
              <text x="250" y="55" textAnchor="middle" fill="var(--text-secondary)" fontSize="9">
                Downstream
              </text>
              <path d="M 75 50 L 98 50" stroke="var(--accent)" strokeWidth="1.5" />
              <path
                d="M 162 50 L 215 50"
                stroke="var(--text-muted)"
                strokeWidth="1.5"
                strokeDasharray="4 3"
              />
              <text x="188" y="42" textAnchor="middle" fill="var(--text-muted)" fontSize="7">
                open — fail fast
              </text>
            </svg>
          </div>
        </div>
        <Tradeoffs>
          <li>
            <span className={styles.em}>Win:</span> failing dependencies do not soak threads and timeouts.
          </li>
          <li>
            <span className={styles.em}>Tuning:</span> thresholds and half-open probes must match real SLOs.
          </li>
        </Tradeoffs>
      </div>
    )
  }

  return (
    <div className={styles.wrap}>
      {base}
      <div className={styles.diagramCard}>
        <span className={styles.diagramLabel}>Diagram</span>
        <div className={styles.diagramBody}>
          <p className={styles.bottomNote}>Visual for this topic is not wired yet.</p>
        </div>
      </div>
    </div>
  )
}
