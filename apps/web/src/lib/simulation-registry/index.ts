import type { VizComponent } from './types'
import { CachingViz } from './adapters/caching'
import { DependencyInjectionViz } from './adapters/dependency-injection'
import { LoadBalancerRRViz } from './adapters/load-balancer'
import { NumericalViz } from './adapters/numerical'
import { SingletonViz } from './adapters/singleton'

export type { VizProps, VizComponent } from './types'

/** Maps Mongo `vizType` → simulation adapter component. */
export const VIZ_REGISTRY: Record<string, VizComponent> = {
  caching: CachingViz,
  singleton: SingletonViz,
  'dependency-injection': DependencyInjectionViz,
  numerical: NumericalViz,
  'load-balancer': LoadBalancerRRViz,
}
