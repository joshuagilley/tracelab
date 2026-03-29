import type { MetricGroupDef } from '@/types/labConcept'
import styles from './MetricsPanel.module.css'

interface Props {
  groups: MetricGroupDef[]
  values: Record<string, string>
  isRunning: boolean
}

/**
 * Generic live-metrics panel — driven by the concept's JSON metricGroups config.
 * Values are emitted by the visualizer component and displayed here as read-only tiles.
 */
export default function MetricsPanel({ groups, values, isRunning }: Props) {
  if (!groups.length) return null

  const blank = '--'

  return (
    <div className={`panel ${styles.panel}`}>
      {groups.map((group, i) => (
        <div key={group.label} className={styles.group}>
          {i > 0 && <div className={styles.divider} />}
          <div className={styles.groupLabel}>{group.label}</div>
          <div className={styles.stats}>
            {group.metrics.map(m => (
              <Stat
                key={m.id}
                label={m.label}
                value={isRunning ? (values[m.id] ?? blank) : blank}
                accent={m.accent}
                color={m.color}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

function Stat({
  label,
  value,
  accent,
  color,
}: {
  label: string
  value: string
  accent?: boolean
  color?: string
}) {
  return (
    <div className={styles.stat}>
      <div className={styles.statLabel}>{label}</div>
      <div
        className={styles.statValue}
        style={{ color: color ?? (accent ? 'var(--text-primary)' : 'var(--text-secondary)') }}
      >
        {value}
      </div>
    </div>
  )
}
