import type { LabId } from '@/contexts/lab'
import type { LabParameter, MetricGroupDef, PracticeConfig } from '@/types/labConcept'

import cachingDetail          from '@/features/system-design/concepts/caching.json'
import singletonDetail        from '@/features/design-patterns/concepts/singleton.json'
import diDetail               from '@/features/design-patterns/concepts/dependency-injection.json'
import numericalDetail        from '@/features/data-science/concepts/numerical-computing.json'
import rateLimitingDetail     from '@/features/api-design/concepts/rate-limiting.json'
import pkFkDetail             from '@/features/database-design/concepts/primary-keys-foreign-keys.json'
import pointersDetail         from '@/features/low-level-systems/concepts/pointers.json'
import cloudVpcDetail         from '@/features/cloud-architecture/concepts/vpc.json'
import cloudPpsDetail         from '@/features/cloud-architecture/concepts/public-private-subnets.json'
import cloudLbDetail          from '@/features/cloud-architecture/concepts/load-balancer-l4-l7.json'
import cloudS3Detail          from '@/features/cloud-architecture/concepts/object-storage-s3.json'
import cloudSqsDetail         from '@/features/cloud-architecture/concepts/queue-sqs.json'
import cloudLambdaDetail      from '@/features/cloud-architecture/concepts/serverless-lambda.json'

/** Shape of a per-concept detail JSON file. */
export interface ConceptDetail {
  parameters?: LabParameter[]
  metricGroups?: MetricGroupDef[]
  codeFiles?: {
    name: string
    lang: string
    code: string
    role?: string
  }[]
  practice?: PracticeConfig
}

/**
 * Per-concept configuration keyed by [labId][slug].
 * Add a new concept JSON import and entry here when building out a new page.
 * The catalog JSON (e.g. system-design.json) stays lean — just list metadata.
 */
export const CONCEPT_DETAIL_REGISTRY: Partial<Record<LabId, Record<string, ConceptDetail>>> = {
  'system-design': {
    caching:                  cachingDetail as ConceptDetail,
  },
  'design-patterns': {
    singleton:                singletonDetail as ConceptDetail,
    'dependency-injection':   diDetail as ConceptDetail,
  },
  'data-science': {
    'numerical-computing':    numericalDetail as ConceptDetail,
  },
  'api-design': {
    'rate-limiting':          rateLimitingDetail as ConceptDetail,
  },
  'database-design': {
    'primary-keys-foreign-keys': pkFkDetail as ConceptDetail,
  },
  'low-level-systems': {
    pointers:                 pointersDetail as ConceptDetail,
  },
  'cloud-architecture': {
    vpc:                      cloudVpcDetail as ConceptDetail,
    'public-private-subnets': cloudPpsDetail as ConceptDetail,
    'load-balancer-l4-l7':    cloudLbDetail as ConceptDetail,
    'object-storage-s3':      cloudS3Detail as ConceptDetail,
    'queue-sqs':              cloudSqsDetail as ConceptDetail,
    'serverless-lambda':      cloudLambdaDetail as ConceptDetail,
  },
}
