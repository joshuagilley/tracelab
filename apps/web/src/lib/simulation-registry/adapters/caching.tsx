import { useState, useEffect, useCallback } from 'react'
import CachingSimulation, { type SimMetrics } from '@/components/simulations/system-design/CachingSimulation'
import type { VizProps } from '../types'

const EMPTY_CACHING_METRICS: Record<string, string> = {
  latency: '--',
  throughput: '--',
  cacheHit: '--',
  successRate: '--',
  hits: '--',
  misses: '--',
  total: '--',
}

/** Adapter: generic VizProps → CachingSimulation + live metrics for the metrics panel. */
export function CachingViz({ paramValues, onMetrics, isRunning, onToggleRun }: VizProps) {
  const hitRate = ((paramValues.hitRate as number) ?? 70) / 100
  const [sim, setSim] = useState<SimMetrics>({ hits: 0, misses: 0, total: 0 })

  const handleSim = useCallback((m: SimMetrics) => setSim(m), [])

  useEffect(() => {
    if (!isRunning) {
      onMetrics({ ...EMPTY_CACHING_METRICS })
      return
    }
    const id = setInterval(() => {
      const hr = sim.total > 0 ? sim.hits / sim.total : hitRate
      const hitMs = 2 + Math.random() * 6
      const misMs = 20 + Math.random() * 40
      const pct =
        sim.total > 0 ? ((sim.hits / sim.total) * 100).toFixed(1) : (hitRate * 100).toFixed(1)
      onMetrics({
        latency: `${Math.round(hr * hitMs + (1 - hr) * misMs)}ms`,
        throughput: String(Math.round(800 + Math.random() * 600)),
        cacheHit: `${pct}%`,
        successRate: '99.98%',
        hits: sim.total > 0 ? String(sim.hits) : '--',
        misses: sim.total > 0 ? String(sim.misses) : '--',
        total: sim.total > 0 ? String(sim.total) : '--',
      })
    }, 400)
    return () => clearInterval(id)
  }, [isRunning, sim, hitRate, onMetrics])

  return (
    <CachingSimulation
      isRunning={isRunning}
      hitRate={hitRate}
      onMetrics={handleSim}
      onToggleRun={onToggleRun}
    />
  )
}
