import type { BlackGeom, DiParticle, S3Geom, StorageBackend, UplGeom } from './dependencyInjectionSimulationRoute'

export interface DependencyInjectionSimulationDiagramProps {
  uid: string
  m2: string
  vbW: number
  vbH: number
  n: number
  isRunning: boolean
  handlerY: (i: number) => number
  labels: string[]
  particles: DiParticle[]
  storageBackend: StorageBackend
  emphasizeIface: boolean
  wirePulse: boolean
  black: BlackGeom
  upl: UplGeom
  s3Top: S3Geom
  s3Bot: S3Geom
  mockSink: { x: number; y: number }
  midY: number
  leftCx: number
}
