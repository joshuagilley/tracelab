import { useCallback } from 'react'
import SingletonSimulation, { type SingletonStats } from '@/components/simulations/design-patterns/SingletonSimulation'
import { getBoolean, getNumber } from '../param-utils'
import type { VizProps } from '../types'

export function SingletonViz({ paramValues, onMetrics, isRunning, onToggleRun }: VizProps) {
  const handlerCount = getNumber(paramValues, 'handlerCount', 3)
  const spawnIntervalMs = getNumber(paramValues, 'spawnIntervalMs', 450)
  const stressMode = getBoolean(paramValues, 'stressMode', false)
  const emphasizeOnce = getBoolean(paramValues, 'emphasizeOnce', true)

  const handleStats = useCallback(
    (s: SingletonStats) => {
      onMetrics({
        getInstanceCalls: String(s.getInstanceCalls),
        initRuns: String(s.initRuns),
        fastPathReturns: String(s.fastPathReturns),
      })
    },
    [onMetrics],
  )

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
