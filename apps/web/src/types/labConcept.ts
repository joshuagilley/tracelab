import type { Concept } from './concept'

export interface LabParameter {
  id: string
  label: string
  type: 'select' | 'slider'
  options?: string[]
  defaultOption?: string
  min?: number
  max?: number
  step?: number
  default?: number
}

export interface LabCodeFile {
  name: string
  lang: string
  code: string
}

export interface LabConceptDetail extends Concept {
  labKind: string
  vizType: string
  codeFiles: LabCodeFile[]
  parameters?: LabParameter[]
}
