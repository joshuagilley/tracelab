import { useState, useEffect } from 'react'
import type { SimMetrics } from './SimulationPanel'
import styles from './MetricsPanel.module.css'

interface Props {
  isRunning: boolean
  metrics: SimMetrics
  hitRate: number
  onHitRateChange: (v: number) => void
  onToggleRun: () => void
}

export default function MetricsPanel({ isRunning, metrics, hitRate, onHitRateChange, onToggleRun }: Props) {
  const [latency, setLatency]     = useState(0)
  const [throughput, setThroughput] = useState(0)

  // Simulate realistic latency and throughput fluctuations during run
  useEffect(() => {
    if (!isRunning) {
      setLatency(0)
      setThroughput(0)
      return
    }
    const id = setInterval(() => {
      // Cache hits are fast (2-8ms), misses go to DB (20-60ms)
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

  const barWidths = metrics.total > 0
    ?         Array.from({ length: 7 }, () => {
        const base = parseFloat(cacheHitPct) / 100
        return Math.max(10, Math.min(98, (base + (Math.random() - 0.5) * 0.15) * 100))
      })
    : [60, 75, 80, 70, 88, 82, 92]

  return (
    <div className={styles.panel}>

      {/* ── Run control ──────────────────────────── */}
      <button
        className={[styles.runBtn, isRunning ? styles.runBtnActive : ''].join(' ')}
        onClick={onToggleRun}
      >
        <span>{isRunning ? '■' : '▶'}</span>
        {isRunning ? 'STOP SIMULATION' : 'EXECUTE SIMULATION'}
      </button>

      {/* ── Simulation params ────────────────────── */}
      <div className={`panel ${styles.section}`}>
        <div className="panel-header">
          <span className="panel-label">Simulation Parameters</span>
        </div>
        <div className={styles.params}>
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
          <SliderParam
            label="SEG DURATION"
            value={550}
            unit="ms"
            min={100}
            max={2000}
            readOnly
          />
        </div>
      </div>

      {/* ── Performance metrics ──────────────────── */}
      <div className={`panel ${styles.section}`}>
        <div className="panel-header">
          <span className="panel-label">Performance Metrics</span>
        </div>
        <div className={styles.metrics}>
          <div className={styles.statRow}>
            <StatBox label="Latency"    value={isRunning ? `${latency}ms` : '--'}   />
            <StatBox label="Throughput" value={isRunning ? `${throughput}` : '--'}  />
          </div>

          <div className={styles.metricBlock}>
            <div className={styles.metricLabelRow}>
              <span className={styles.metricLabel}>Cache Hit Ratio</span>
              <span className={styles.metricValue}>{isRunning ? `${cacheHitPct}%` : '--'}</span>
            </div>
            {isRunning && (
              <div className={styles.barChart}>
                {barWidths.map((w, i) => (
                  <div key={i} className={styles.bar} style={{ height: `${w * 0.6}%` }} />
                ))}
              </div>
            )}
          </div>

          <div className={styles.metricBlock}>
            <div className={styles.metricLabelRow}>
              <span className={styles.metricLabel}>Node Success Rate</span>
              <span className={styles.metricValue}>{isRunning ? '99.98%' : '--'}</span>
            </div>
            {isRunning && (
              <div className={styles.progressBar}>
                <div className={styles.progressFill} style={{ width: '99.98%' }} />
              </div>
            )}
          </div>

          {metrics.total > 0 && (
            <div className={styles.counters}>
              <div className={styles.counter}>
                <span className={styles.counterVal} style={{ color: 'var(--accent)' }}>{metrics.hits}</span>
                <span className={styles.counterLabel}>Hits</span>
              </div>
              <div className={styles.counter}>
                <span className={styles.counterVal} style={{ color: 'var(--color-hard)' }}>{metrics.misses}</span>
                <span className={styles.counterLabel}>Misses</span>
              </div>
              <div className={styles.counter}>
                <span className={styles.counterVal}>{metrics.total}</span>
                <span className={styles.counterLabel}>Total</span>
              </div>
            </div>
          )}
        </div>
      </div>

      <p className={styles.hint}>
        Architecture optimized for high-read throughput scenarios.
      </p>
    </div>
  )
}

// ─── Sub-components ────────────────────────────────────────────

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
    <div className={styles.sliderRow}>
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

function StatBox({ label, value }: { label: string; value: string }) {
  return (
    <div className={styles.statBox}>
      <div className={styles.statLabel}>{label.toUpperCase()}</div>
      <div className={styles.statValue}>{value}</div>
    </div>
  )
}
