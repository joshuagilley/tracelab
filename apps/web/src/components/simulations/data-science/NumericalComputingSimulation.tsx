import { useMemo } from 'react'
import type { NumpyFn } from '@/lib/numpyDemo'
import { computeArray, stats } from '@/lib/numpyDemo'
import styles from './NumericalComputingSimulation.module.css'

interface Props {
  numpyFn: NumpyFn
  length: number
  isRunning: boolean
  onToggleRun: () => void
}

export default function NumericalComputingSimulation({
  numpyFn,
  length,
  isRunning,
  onToggleRun,
}: Props) {
  const values = useMemo(() => computeArray(numpyFn, length), [numpyFn, length])
  const { sum, mean, min, max } = useMemo(() => stats(values), [values])
  const maxBar = Math.max(...values.map(Math.abs), 1e-9)

  return (
    <div className={`panel ${styles.panel}`}>
      <div className="panel-header">
        <span className="panel-label">Array Visualizer</span>
        <div className={styles.headerRight}>
          <div className="status-dot">
            <span className={`dot ${isRunning ? 'live' : ''}`} />
            <span>{isRunning ? 'LIVE PREVIEW' : 'READY'}</span>
          </div>
          <button
            type="button"
            className={[styles.runBtn, isRunning ? styles.runBtnActive : ''].join(' ')}
            onClick={onToggleRun}
          >
            <span>{isRunning ? '■' : '▶'}</span>
            {isRunning ? 'STOP' : 'RUN PREVIEW'}
          </button>
        </div>
      </div>

      <div className={styles.body}>
        <p className={styles.subtitle}>
          In-browser preview of <code>numpy.{numpyFn}</code>-style behavior with length <code>{length}</code> — same
          shapes as the lesson’s embedded Python, computed locally for the visualizer (no remote kernel).
        </p>

        <div className={styles.barRow}>
          {values.slice(0, 32).map((v, i) => {
            const h = (Math.abs(v) / maxBar) * 100
            return (
              <div key={i} className={styles.barWrap} title={`[${i}] = ${v}`}>
                <div
                  className={styles.bar}
                  style={{
                    height: `${Math.max(4, h)}%`,
                    opacity: isRunning ? 1 : 0.55,
                  }}
                />
              </div>
            )
          })}
        </div>

        <div className={styles.stats}>
          <span><strong>shape</strong> ({values.length},)</span>
          <span><strong>dtype</strong> float64</span>
          <span><strong>sum</strong> {sum.toFixed(4)}</span>
          <span><strong>mean</strong> {mean.toFixed(4)}</span>
          <span><strong>min</strong> {min.toFixed(4)}</span>
          <span><strong>max</strong> {max.toFixed(4)}</span>
        </div>
      </div>
    </div>
  )
}
