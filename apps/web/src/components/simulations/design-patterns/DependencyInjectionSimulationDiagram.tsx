import { DiDiagramS3Bottom, DiDiagramS3Top } from '@/components/simulations/design-patterns/DependencyInjectionDiagramS3'
import type { DependencyInjectionSimulationDiagramProps } from './DependencyInjectionSimulationDiagram.types'
import {
  DiDiagramDefs,
  DiDiagramJobsColumn,
  DiIngestServiceShell,
  DiJobIngressPaths,
  DiParticlesLayer,
  DiStorageExitPaths,
  DiUploaderChip,
} from './DependencyInjectionSimulationDiagramParts'
import styles from './DependencyInjectionSimulation.module.css'

export type { DependencyInjectionSimulationDiagramProps } from './DependencyInjectionSimulationDiagram.types'

export function DependencyInjectionSimulationDiagram(p: DependencyInjectionSimulationDiagramProps) {
  const activeSftp = p.storageBackend === 'sftp'
  const activeWebdav = p.storageBackend === 'webdav'
  const activeMock = p.storageBackend === 'mock'
  return (
    <svg viewBox={`0 0 ${p.vbW} ${p.vbH}`} className={styles.svg} aria-hidden>
      <DiDiagramDefs uid={p.uid} m2={p.m2} />
      <DiDiagramJobsColumn n={p.n} isRunning={p.isRunning} handlerY={p.handlerY} labels={p.labels} />
      <DiDiagramS3Top uid={p.uid} s3Top={p.s3Top} active={activeSftp} emphasizeIface={p.emphasizeIface} />
      <DiDiagramS3Bottom uid={p.uid} s3Bot={p.s3Bot} active={activeWebdav} emphasizeIface={p.emphasizeIface} />
      <DiJobIngressPaths n={p.n} leftCx={p.leftCx} handlerY={p.handlerY} black={p.black} midY={p.midY} />
      <DiIngestServiceShell black={p.black} midY={p.midY} />
      <DiUploaderChip
        upl={p.upl}
        wirePulse={p.wirePulse}
        activeSftp={activeSftp}
        activeWebdav={activeWebdav}
        storageBackend={p.storageBackend}
      />
      <DiStorageExitPaths
        black={p.black}
        midY={p.midY}
        s3Top={p.s3Top}
        s3Bot={p.s3Bot}
        mockSink={p.mockSink}
        m2={p.m2}
        activeSftp={activeSftp}
        activeWebdav={activeWebdav}
        activeMock={activeMock}
      />
      <DiParticlesLayer
        particles={p.particles}
        storageBackend={p.storageBackend}
        leftCx={p.leftCx}
        midY={p.midY}
        handlerY={p.handlerY}
        black={p.black}
        upl={p.upl}
        s3Top={p.s3Top}
        s3Bot={p.s3Bot}
        mockSink={p.mockSink}
      />
    </svg>
  )
}
