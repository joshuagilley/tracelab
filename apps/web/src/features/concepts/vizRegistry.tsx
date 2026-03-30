import { useState, useEffect, useCallback, type ComponentType } from 'react'
import CachingSimulation, { type SimMetrics } from '@/components/simulations/system-design/CachingSimulation'
import SingletonSimulation, { type SingletonStats } from '@/components/simulations/design-patterns/SingletonSimulation'
import DependencyInjectionSimulation, {
  type DIStats,
  type StorageBackend,
} from '@/components/simulations/design-patterns/DependencyInjectionSimulation'
import NumericalComputingSimulation from '@/components/simulations/data-science/NumericalComputingSimulation'
import LoadBalancerRoundRobinSimulation from '@/components/simulations/system-design/LoadBalancerRoundRobinSimulation'
import type { NumpyFn } from '@/lib/numpyDemo'

/**
 * Generic props every visualizer receives.
 * - paramValues: controlled state seeded from JSON defaults, updated by ParametersPanel
 * - onMetrics: emit live formatted values keyed by MetricDef.id  (displayed by MetricsPanel)
 * - isRunning / onToggleRun: simulation lifecycle
 */
export interface VizProps {
  paramValues: Record<string, number | boolean | string>
  onMetrics: (values: Record<string, string>) => void
  isRunning: boolean
  onToggleRun: () => void
}

export type VizComponent = ComponentType<VizProps>

// ─── Concept adapters ────────────────────────────────────────────────────────
// Each function below is the ONLY glue code needed per concept.
// It maps generic paramValues → typed viz props and emits formatted metric strings.

function CachingViz({ paramValues, onMetrics, isRunning, onToggleRun }: VizProps) {
  const hitRate = ((paramValues.hitRate as number) ?? 70) / 100
  const [sim, setSim] = useState<SimMetrics>({ hits: 0, misses: 0, total: 0 })

  const handleSim = useCallback((m: SimMetrics) => setSim(m), [])

  useEffect(() => {
    if (!isRunning) {
      onMetrics({ latency: '--', throughput: '--', cacheHit: '--', successRate: '--', hits: '--', misses: '--', total: '--' })
      return
    }
    const id = setInterval(() => {
      const hr    = sim.total > 0 ? sim.hits / sim.total : hitRate
      const hitMs = 2  + Math.random() * 6
      const misMs = 20 + Math.random() * 40
      const pct   = sim.total > 0
        ? ((sim.hits / sim.total) * 100).toFixed(1)
        : (hitRate * 100).toFixed(1)
      onMetrics({
        latency:     `${Math.round(hr * hitMs + (1 - hr) * misMs)}ms`,
        throughput:  String(Math.round(800 + Math.random() * 600)),
        cacheHit:    `${pct}%`,
        successRate: '99.98%',
        hits:    sim.total > 0 ? String(sim.hits)   : '--',
        misses:  sim.total > 0 ? String(sim.misses) : '--',
        total:   sim.total > 0 ? String(sim.total)  : '--',
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

function SingletonViz({ paramValues, onMetrics, isRunning, onToggleRun }: VizProps) {
  const handlerCount    = (paramValues.handlerCount    as number)  ?? 3
  const spawnIntervalMs = (paramValues.spawnIntervalMs as number)  ?? 450
  const stressMode      = (paramValues.stressMode      as boolean) ?? false
  const emphasizeOnce   = (paramValues.emphasizeOnce   as boolean) ?? true

  const handleStats = useCallback((s: SingletonStats) => {
    onMetrics({
      getInstanceCalls: String(s.getInstanceCalls),
      initRuns:         String(s.initRuns),
      fastPathReturns:  String(s.fastPathReturns),
    })
  }, [onMetrics])

  return (
    <SingletonSimulation
      isRunning={isRunning}
      onToggleRun={onToggleRun}
      handlerCount={handlerCount}
      spawnIntervalMs={spawnIntervalMs}
      stressMode={stressMode}
      emphasizeOnce={emphasizeOnce}
      onStatsChange={handleStats}
    />
  )
}

function DependencyInjectionViz({ paramValues, onMetrics, isRunning, onToggleRun }: VizProps) {
  const handlerCount    = (paramValues.handlerCount    as number)         ?? 3
  const spawnIntervalMs = (paramValues.spawnIntervalMs as number)         ?? 450
  const stressMode      = (paramValues.stressMode      as boolean)        ?? false
  const storageBackend  = (paramValues.storageBackend  as StorageBackend) ?? 'sftp'
  const emphasizeIface  = (paramValues.emphasizeIface  as boolean)        ?? true

  const handleStats = useCallback((s: DIStats) => {
    onMetrics({
      uploadsCompleted: String(s.uploadsCompleted),
      putCalls:         String(s.putCalls),
      wires:            String(s.wires),
    })
  }, [onMetrics])

  return (
    <DependencyInjectionSimulation
      isRunning={isRunning}
      onToggleRun={onToggleRun}
      handlerCount={handlerCount}
      spawnIntervalMs={spawnIntervalMs}
      stressMode={stressMode}
      storageBackend={storageBackend}
      emphasizeIface={emphasizeIface}
      onStatsChange={handleStats}
    />
  )
}

function LoadBalancerRRViz({ onMetrics, isRunning, onToggleRun }: VizProps) {
  return (
    <LoadBalancerRoundRobinSimulation
      isRunning={isRunning}
      onToggleRun={onToggleRun}
      onMetrics={onMetrics}
    />
  )
}

function NumericalViz({ paramValues, isRunning, onToggleRun }: VizProps) {
  const numpyFn = (paramValues.numpy_fn  as NumpyFn) ?? 'ones'
  const length  = (paramValues.array_len as number)  ?? 8

  return (
    <NumericalComputingSimulation
      numpyFn={numpyFn}
      length={length}
      isRunning={isRunning}
      onToggleRun={onToggleRun}
    />
  )
}

// ─── Registry ────────────────────────────────────────────────────────────────
// Add a new concept: write one adapter function above, register it here.

export const VIZ_REGISTRY: Record<string, VizComponent> = {
  caching:                CachingViz,
  singleton:              SingletonViz,
  'dependency-injection': DependencyInjectionViz,
  numerical:              NumericalViz,
  'load-balancer':        LoadBalancerRRViz,
}
