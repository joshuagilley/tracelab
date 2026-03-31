import LoadBalancerRoundRobinSimulation from '@/components/simulations/system-design/LoadBalancerRoundRobinSimulation'
import type { VizProps } from '../types'

export function LoadBalancerRRViz({ onMetrics, isRunning, onToggleRun }: VizProps) {
  return (
    <LoadBalancerRoundRobinSimulation
      isRunning={isRunning}
      onToggleRun={onToggleRun}
      onMetrics={onMetrics}
    />
  )
}
