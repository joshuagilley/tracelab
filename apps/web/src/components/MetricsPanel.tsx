import { useState, useEffect } from 'react'
import type { SimMetrics } from './SimulationPanel'
import styles from './MetricsPanel.module.css'

interface Props {
  isRunning: boolean
  metrics: SimMetrics
  hitRate: number
  onHitRateChange: (v: number) => void
}

export default function MetricsPanel({ isRunning, metrics, hitRate, onHitRateChange }: Props) {
  const [latency, setLatency]       = useState(0)
  const [throughput, setThroughput] = useState(0)

  useEffect(() => {
    if (!isRunning) {
      setLatency(0)
      setThroughput(0)
      return
    }
    const id = setInterval(() => {
      const hitMs  = 2 + Math.random() * 6
      const missMs = 20 + Math.random() * 40
      const hr = metrics.total > 0 ? metrics.hits / metrics.total : hitRate
      setLatency(Math.round(hr * hitMs + (1 - hr) * missMs))
      setThroughput(Math.round(800 + Math.random() * 600))
    }, 400)
    return () => clearInterval(id)
  }, [isRunning, metrics, hitRate])

  const cacheHitPct = metrics.total > 0
    ? ((metrics.hits / metrics.total) * 100).toFixed(1)
    : (hitRate * 100).toFixed(1)

  const blank = '--'

  return (
    <div className={`panel ${styles.strip}`}>
      {/* ── Sim params ─────────────────────────── */}
      <div className={styles.group}>
        <div className={styles.groupLabel}>SIMULATION PARAMETERS</div>
        <div className={styles.sliders}>
          <SliderParam
            label="HIT RATE"
            value={Math.round(hitRate * 100)}
            unit="%"
            min={0}
            max={100}
            onChange={v => onHitRateChange(v / 100)}
          />
          <SliderParam
            label="SPAWN RATE"
            value={900}
            unit="ms"
            min={200}
            max={2000}
            readOnly
          />
        </div>
      </div>

      <div className={styles.divider} />

      {/* ── Live stats ─────────────────────────── */}
      <div className={styles.group}>
        <div className={styles.groupLabel}>PERFORMANCE METRICS</div>
        <div className={styles.stats}>
          <Stat label="LATENCY"      value={isRunning ? `${latency}ms`    : blank} accent />
          <Stat label="THROUGHPUT"   value={isRunning ? `${throughput}`   : blank} accent />
          <Stat label="CACHE HIT"    value={isRunning ? `${cacheHitPct}%` : blank} accent />
          <Stat label="SUCCESS RATE" value={isRunning ? '99.98%'          : blank} accent />
        </div>
      </div>

      <div className={styles.divider} />

      {/* ── Request counters ───────────────────── */}
      <div className={styles.group}>
        <div className={styles.groupLabel}>REQUEST LOG</div>
        <div className={styles.stats}>
          <Stat label="HITS"   value={metrics.total > 0 ? String(metrics.hits)   : blank} color="var(--accent)" />
          <Stat label="MISSES" value={metrics.total > 0 ? String(metrics.misses) : blank} color="var(--color-hard)" />
          <Stat label="TOTAL"  value={metrics.total > 0 ? String(metrics.total)  : blank} />
        </div>
      </div>
    </div>
  )
}

// ─── Sub-components ────────────────────────────────────────────

function Stat({ label, value, accent, color }: { label: string; value: string; accent?: boolean; color?: string }) {
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

interface SliderProps {
  label: string
  value: number
  unit: string
  min: number
  max: number
  onChange?: (v: number) => void
  readOnly?: boolean
}

function SliderParam({ label, value, unit, min, max, onChange, readOnly }: SliderProps) {
  return (
    <div className={styles.sliderItem}>
      <div className={styles.sliderTop}>
        <span className={styles.sliderLabel}>{label}</span>
        <span className={styles.sliderValue}>{value}{unit}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        disabled={readOnly}
        onChange={e => onChange?.(Number(e.target.value))}
        className={styles.slider}
      />
    </div>
  )
}
