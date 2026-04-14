export interface SingletonStats {
  getInstanceCalls: number
  initRuns: number
  fastPathReturns: number
}

export interface SingletonParticle {
  id: number
  t: number
  handlerIndex: number
}
