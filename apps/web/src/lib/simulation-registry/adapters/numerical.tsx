import NumericalComputingSimulation from '@/components/simulations/data-science/NumericalComputingSimulation'
import type { NumpyFn } from '@/lib/numpy-demo'
import { getNumber, getString } from '../param-utils'
import type { VizProps } from '../types'

export function NumericalViz({ paramValues, isRunning, onToggleRun }: VizProps) {
  const numpyFn = getString<NumpyFn>(paramValues, 'numpy_fn', 'ones')
  const length = getNumber(paramValues, 'array_len', 8)

  return (
    <NumericalComputingSimulation
      numpyFn={numpyFn}
      length={length}
      isRunning={isRunning}
      onToggleRun={onToggleRun}
    />
  )
}
