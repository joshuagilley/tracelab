import type { LabId } from '@/contexts/lab'

import apiRatePresent from '@/components/api-design/concepts/rate-limiting/present.go?raw'
import apiRateBad from '@/components/api-design/concepts/rate-limiting/bad.go?raw'

import cloudVpcPresent from '@/components/cloud-architecture/concepts/vpc/present.go?raw'
import cloudVpcBad from '@/components/cloud-architecture/concepts/vpc/bad.go?raw'
import cloudPpsPresent from '@/components/cloud-architecture/concepts/public-private-subnets/present.go?raw'
import cloudPpsBad from '@/components/cloud-architecture/concepts/public-private-subnets/bad.go?raw'
import cloudLbPresent from '@/components/cloud-architecture/concepts/load-balancer-l4-l7/present.go?raw'
import cloudLbBad from '@/components/cloud-architecture/concepts/load-balancer-l4-l7/bad.go?raw'
import cloudS3Present from '@/components/cloud-architecture/concepts/object-storage-s3/present.go?raw'
import cloudS3Bad from '@/components/cloud-architecture/concepts/object-storage-s3/bad.go?raw'
import cloudSqsPresent from '@/components/cloud-architecture/concepts/queue-sqs/present.go?raw'
import cloudSqsBad from '@/components/cloud-architecture/concepts/queue-sqs/bad.go?raw'
import cloudLambdaPresent from '@/components/cloud-architecture/concepts/serverless-lambda/present.go?raw'
import cloudLambdaBad from '@/components/cloud-architecture/concepts/serverless-lambda/bad.go?raw'

import dbPkPresent from '@/components/database-design/concepts/primary-keys-foreign-keys/present.go?raw'
import dbPkBad from '@/components/database-design/concepts/primary-keys-foreign-keys/bad.go?raw'

import dsNumPresent from '@/components/data-science/numerical-computing/numerical-computing/present.py?raw'
import dsNumBad from '@/components/data-science/numerical-computing/numerical-computing/bad.py?raw'

import dpSingletonPresent from '@/components/design-patterns/creational/singleton/present.go?raw'
import dpSingletonBad from '@/components/design-patterns/creational/singleton/bad.go?raw'
import dpDiPresent from '@/components/design-patterns/advanced/dependency-injection/present.go?raw'
import dpDiBad from '@/components/design-patterns/advanced/dependency-injection/bad.go?raw'

import llPointersPresent from '@/components/low-level-systems/concepts/pointers/present.c?raw'
import llPointersBad from '@/components/low-level-systems/concepts/pointers/bad.c?raw'

import sdCachingPresent from '@/components/system-design/latency-caching/caching/present.go?raw'
import sdCachingBad from '@/components/system-design/latency-caching/caching/bad.go?raw'

/** Per slug, map code tab name → source (co-located under components/.../concepts/...). */
export type LessonCodeBundle = Record<string, string>

export const LESSON_CODE_BY_LAB_AND_SLUG: Partial<Record<LabId, Record<string, LessonCodeBundle>>> = {
  'system-design': {
    caching: { 'present.go': sdCachingPresent, 'bad.go': sdCachingBad },
  },
  'design-patterns': {
    singleton: { 'present.go': dpSingletonPresent, 'bad.go': dpSingletonBad },
    'dependency-injection': { 'present.go': dpDiPresent, 'bad.go': dpDiBad },
  },
  'data-science': {
    'numerical-computing': { 'present.py': dsNumPresent, 'bad.py': dsNumBad },
  },
  'database-design': {
    'primary-keys-foreign-keys': { 'present.go': dbPkPresent, 'bad.go': dbPkBad },
  },
  'cloud-architecture': {
    vpc: { 'present.go': cloudVpcPresent, 'bad.go': cloudVpcBad },
    'public-private-subnets': { 'present.go': cloudPpsPresent, 'bad.go': cloudPpsBad },
    'load-balancer-l4-l7': { 'present.go': cloudLbPresent, 'bad.go': cloudLbBad },
    'object-storage-s3': { 'present.go': cloudS3Present, 'bad.go': cloudS3Bad },
    'queue-sqs': { 'present.go': cloudSqsPresent, 'bad.go': cloudSqsBad },
    'serverless-lambda': { 'present.go': cloudLambdaPresent, 'bad.go': cloudLambdaBad },
  },
  'api-design': {
    'rate-limiting': { 'present.go': apiRatePresent, 'bad.go': apiRateBad },
  },
  'low-level-systems': {
    pointers: { 'present.c': llPointersPresent, 'bad.c': llPointersBad },
  },
}
