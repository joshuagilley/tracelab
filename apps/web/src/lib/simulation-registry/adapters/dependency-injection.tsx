import { useCallback } from 'react'
import DependencyInjectionSimulation, {
  type DIStats,
  type StorageBackend,
} from '@/components/simulations/design-patterns/DependencyInjectionSimulation'
import { getBoolean, getNumber, getString } from '../param-utils'
import type { VizProps } from '../types'

export function DependencyInjectionViz({ paramValues, onMetrics, isRunning, onToggleRun }: VizProps) {
  const handlerCount = getNumber(paramValues, 'handlerCount', 3)
  const spawnIntervalMs = getNumber(paramValues, 'spawnIntervalMs', 450)
  const stressMode = getBoolean(paramValues, 'stressMode', false)
  const storageBackend = getString<StorageBackend>(paramValues, 'storageBackend', 'sftp')
  const emphasizeIface = getBoolean(paramValues, 'emphasizeIface', true)

  const handleStats = useCallback(
    (s: DIStats) => {
      onMetrics({
        uploadsCompleted: String(s.uploadsCompleted),
        putCalls: String(s.putCalls),
        wires: String(s.wires),
      })
    },
    [onMetrics],
  )

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
