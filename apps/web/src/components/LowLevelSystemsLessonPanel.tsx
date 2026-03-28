import { useId } from 'react'
import styles from './LowLevelSystemsLessonPanel.module.css'

interface Props {
  summary: string
  slug: string
}

/** Memory diagrams + takeaways for low-level-systems lessons (C). */
export default function LowLevelSystemsLessonPanel({ summary, slug }: Props) {
  const uid = useId().replace(/:/g, '')

  if (slug === 'pointers') {
    return (
      <div className={styles.wrap}>
        <p className={styles.problem}>{summary}</p>
        <div className={styles.diagramCard}>
          <span className={styles.diagramLabel}>Memory picture</span>
          <div className={styles.diagramBody}>
            <svg
              width="320"
              height="200"
              viewBox="0 0 320 200"
              aria-label="int x holds 10 at one address; int pointer p holds the address of x; arrow from p to x"
            >
              <text x="160" y="18" textAnchor="middle" fill="var(--text-muted)" fontSize="9" fontFamily="var(--font-mono)">
                stack (conceptual addresses)
              </text>

              <rect x="40" y="36" width="110" height="72" rx="6" fill="var(--bg-base)" stroke="var(--accent)" strokeWidth="1.5" />
              <text x="95" y="58" textAnchor="middle" fill="var(--text-primary)" fontSize="12" fontWeight="600">
                int x
              </text>
              <text x="95" y="78" textAnchor="middle" fill="var(--text-secondary)" fontSize="11" fontFamily="var(--font-mono)">
                value: 10
              </text>
              <text x="95" y="98" textAnchor="middle" fill="var(--text-muted)" fontSize="9" fontFamily="var(--font-mono)">
                @ 0x7ffc_a008
              </text>

              <rect x="170" y="36" width="110" height="72" rx="6" fill="var(--bg-base)" stroke="var(--accent)" strokeWidth="1.5" />
              <text x="225" y="58" textAnchor="middle" fill="var(--text-primary)" fontSize="12" fontWeight="600">
                int *p
              </text>
              <text x="225" y="78" textAnchor="middle" fill="var(--text-secondary)" fontSize="11" fontFamily="var(--font-mono)">
                stores addr
              </text>
              <text x="225" y="98" textAnchor="middle" fill="var(--accent)" fontSize="9" fontFamily="var(--font-mono)">
                → 0x7ffc_a008
              </text>

              <path
                d="M 225 108 Q 160 150 95 108"
                stroke="var(--accent)"
                strokeWidth="2"
                fill="none"
                strokeLinecap="round"
                markerEnd={`url(#${uid}-lls-arrow)`}
              />
              <defs>
                <marker
                  id={`${uid}-lls-arrow`}
                  markerWidth="8"
                  markerHeight="8"
                  refX="7"
                  refY="4"
                  orient="auto"
                >
                  <path d="M0,0 L8,4 L0,8 Z" fill="var(--accent)" />
                </marker>
              </defs>

              <text x="160" y="138" textAnchor="middle" fill="var(--accent)" fontSize="9" fontFamily="var(--font-mono)">
                p points at x
              </text>

              <rect x="24" y="152" width="272" height="44" rx="6" fill="var(--bg-subtle)" stroke="var(--border-dim)" strokeWidth="1" />
              <text x="160" y="172" textAnchor="middle" fill="var(--text-secondary)" fontSize="10" fontFamily="var(--font-mono)">
                int *p = &amp;x;
              </text>
              <text x="160" y="188" textAnchor="middle" fill="var(--text-muted)" fontSize="9">
                &amp;x = address of x · *p = int stored there
              </text>
            </svg>
          </div>
        </div>
        <div className={styles.takeaway}>
          <p className={styles.takeawayTitle}>Takeaway</p>
          <p>
            You work with <span className={styles.mono}>&amp;</span> (address-of) and{' '}
            <span className={styles.mono}>*</span> (dereference).{' '}
            <span className={styles.mono}>*p = 42</span> writes through the pointer — it changes{' '}
            <span className={styles.mono}>x</span> because <span className={styles.mono}>p</span> aims at{' '}
            <span className={styles.mono}>x</span>.
          </p>
        </div>
        <p className={styles.bottomNote}>
          Compare <span className={styles.mono}>bad.c</span>: passing the pointer <span className={styles.mono}>p</span> to{' '}
          <span className={styles.mono}>printf(&quot;%d&quot;, …)</span> is not the same as the value{' '}
          <span className={styles.mono}>*p</span>.
        </p>
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
