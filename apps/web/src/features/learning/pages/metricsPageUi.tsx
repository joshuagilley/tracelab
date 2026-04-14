import styles from './MetricsPage.module.css'

export function pct(completed: number, total: number): number {
  if (total <= 0) return 0
  return Math.round((completed / total) * 100)
}

export function ProgressRow({ label, completed, total }: { label: string; completed: number; total: number }) {
  const percent = pct(completed, total)
  return (
    <div className={styles.progressRow}>
      <div className={styles.progressHead}>
        <span>{label}</span>
        <span>
          {completed}/{total} ({percent}%)
        </span>
      </div>
      <div className={styles.progressTrack}>
        <div className={styles.progressFill} style={{ width: `${percent}%` }} />
      </div>
    </div>
  )
}

export function DonutChart({
  label,
  completed,
  total,
  strokeClass,
}: {
  label: string
  completed: number
  total: number
  strokeClass: string
}) {
  const radius = 34
  const circumference = 2 * Math.PI * radius
  const percent = pct(completed, total)
  const offset = circumference - (circumference * percent) / 100
  return (
    <div className={styles.donut}>
      <svg viewBox="0 0 100 100" role="img" aria-label={`${label} completion ${percent}%`}>
        <circle className={styles.donutTrack} cx="50" cy="50" r={radius} />
        <circle
          className={strokeClass}
          cx="50"
          cy="50"
          r={radius}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <div className={styles.donutLabel}>
        <strong>{percent}%</strong>
        <span>{label}</span>
      </div>
    </div>
  )
}
