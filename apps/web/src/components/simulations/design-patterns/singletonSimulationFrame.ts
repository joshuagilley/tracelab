import type { MutableRefObject } from 'react'
import type { SingletonParticle, SingletonStats } from '@/components/simulations/design-patterns/singletonSimulationTypes'

export interface SingletonFrameRefs {
  initDoneRef: MutableRefObject<boolean>
  statsRef: MutableRefObject<SingletonStats>
}

export interface SingletonFrameSetters {
  setOnceDone: (v: boolean) => void
  setOncePulse: (v: boolean) => void
  setCallCount: (n: number) => void
  onStatsChange: (s: SingletonStats) => void
}

export function reduceSingletonParticles(
  prev: SingletonParticle[],
  dt: number,
  pathSpeed: number,
): { next: SingletonParticle[]; completed: SingletonParticle[] } {
  const completed: SingletonParticle[] = []
  const moved = prev
    .map(p => {
      const nt = p.t + pathSpeed * dt
      if (nt >= 1) {
        completed.push(p)
        return null
      }
      return { ...p, t: nt }
    })
    .filter((x): x is SingletonParticle => x !== null)
  return { next: moved, completed }
}

export function applySingletonCompletions(
  completed: SingletonParticle[],
  refs: SingletonFrameRefs,
  setters: SingletonFrameSetters,
): void {
  for (const _ of completed) {
    if (!refs.initDoneRef.current) {
      refs.initDoneRef.current = true
      refs.statsRef.current.getInstanceCalls++
      refs.statsRef.current.initRuns = 1
      setters.setOnceDone(true)
      setters.setOncePulse(true)
      window.setTimeout(() => setters.setOncePulse(false), 380)
    } else {
      refs.statsRef.current.getInstanceCalls++
      refs.statsRef.current.fastPathReturns++
    }
    setters.setCallCount(refs.statsRef.current.getInstanceCalls)
    setters.onStatsChange({ ...refs.statsRef.current })
  }
}

export function spawnSingletonParticles(
  spawnAcc: number,
  dt: number,
  interval: number,
  n: number,
  now: number,
  stress: boolean,
  nextId: MutableRefObject<number>,
): { spawnAcc: number; extra: SingletonParticle[] } {
  let acc = spawnAcc + dt * 1000
  const extra: SingletonParticle[] = []
  while (acc >= interval) {
    acc -= interval
    const hi = stress ? Math.floor(Math.random() * n) : Math.floor((now / 250) % n)
    extra.push({
      id: nextId.current++,
      t: 0,
      handlerIndex: hi,
    })
  }
  return { spawnAcc: acc, extra }
}
