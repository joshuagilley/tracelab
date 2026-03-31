import type { Concept } from './concept'

export interface LabParameter {
  id: string
  label: string
  type: 'select' | 'slider' | 'toggle'
  /** Slider / select options */
  options?: string[]
  defaultOption?: string
  min?: number
  max?: number
  step?: number
  default?: number
  /** Toggle default */
  defaultBool?: boolean
  /** Display suffix (e.g. "%" or "ms") */
  unit?: string
  /** Read-only display-only slider */
  readOnly?: boolean
}

export interface LabCodeFile {
  name: string
  lang: string
  /** Lesson body; Mongo may send `content` instead — UI/API normalize to `code`. */
  code: string
  content?: string
  /** 'present' = idiomatic, 'bad' = anti-pattern, 'exercise' = starter */
  role?: 'present' | 'bad' | 'exercise'
}

/** One metric display tile inside a group */
export interface MetricDef {
  id: string
  label: string
  /** Highlight with primary text color */
  accent?: boolean
  /** Override color (CSS value) */
  color?: string
}

/** A labeled group of metrics in the bottom control panel */
export interface MetricGroupDef {
  label: string
  metrics: MetricDef[]
}

/** One file inside a practice scaffold ZIP */
export interface PracticeFile {
  name: string
  content: string
}

/** Config for the downloadable local practice ZIP attached to a concept */
export interface PracticeConfig {
  zipName: string
  folder: string
  files: PracticeFile[]
}

export interface LabConceptDetail extends Concept {
  labKind: string
  vizType: string
  codeFiles: LabCodeFile[]
  parameters?: LabParameter[]
  metricGroups?: MetricGroupDef[]
  practice?: PracticeConfig
}
