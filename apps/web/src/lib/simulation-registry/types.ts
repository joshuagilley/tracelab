import type { ComponentType } from 'react'

/**
 * Generic props every simulation adapter receives.
 * - paramValues: controlled state seeded from JSON defaults, updated by ParametersPanel
 * - onMetrics: emit live formatted values keyed by MetricDef.id (displayed by MetricsPanel)
 * - isRunning / onToggleRun: simulation lifecycle
 */
export interface VizProps {
  paramValues: Record<string, number | boolean | string>
  onMetrics: (values: Record<string, string>) => void
  isRunning: boolean
  onToggleRun: () => void
}

export type VizComponent = ComponentType<VizProps>
