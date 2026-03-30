import type { ComponentType } from 'react'

import RateLimitingLesson         from '@/components/lessons/api-design/RateLimitingLesson'
import RetriesLesson              from '@/components/lessons/api-design/RetriesLesson'
import CircuitBreakerLesson       from '@/components/lessons/api-design/CircuitBreakerLesson'
import VpcLesson                  from '@/components/lessons/cloud-architecture/VpcLesson'
import PublicPrivateSubnetsLesson from '@/components/lessons/cloud-architecture/PublicPrivateSubnetsLesson'
import LoadBalancerL4L7Lesson     from '@/components/lessons/cloud-architecture/LoadBalancerL4L7Lesson'
import ObjectStorageS3Lesson      from '@/components/lessons/cloud-architecture/ObjectStorageS3Lesson'
import QueueSqsLesson             from '@/components/lessons/cloud-architecture/QueueSqsLesson'
import ServerlessLambdaLesson     from '@/components/lessons/cloud-architecture/ServerlessLambdaLesson'
import PrimaryKeysForeignKeysLesson from '@/components/lessons/database-design/PrimaryKeysForeignKeysLesson'
import PointersLesson             from '@/components/lessons/low-level-systems/PointersLesson'
import LoadBalancingAlgorithmsLesson from '@/components/lessons/system-design/LoadBalancingAlgorithmsLesson'

/** All lesson-panel components receive only a summary prop. */
export interface LessonPanelProps {
  summary: string
}

/**
 * Maps concept slug → lesson panel component.
 * Used by ConceptDetailPage to render the left-column lesson content for any
 * concept whose vizType is 'lesson'.
 *
 * To add a new lesson: create the component under components/lessons/{lab}/,
 * import it here, and add an entry below.
 */
export const LESSON_REGISTRY: Record<string, ComponentType<LessonPanelProps>> = {
  'rate-limiting':              RateLimitingLesson,
  retries:                      RetriesLesson,
  'circuit-breaker':            CircuitBreakerLesson,
  vpc:                          VpcLesson,
  'public-private-subnets':     PublicPrivateSubnetsLesson,
  'load-balancer-l4-l7':        LoadBalancerL4L7Lesson,
  /** System Design lab (same panel as cloud-architecture L4/L7 lesson) */
  'load-balancer':              LoadBalancerL4L7Lesson,
  /** Catalog slug used in Labs for “Load Balancer” */
  'load-balancing':             LoadBalancerL4L7Lesson,
  'load-balancing-algorithms':  LoadBalancingAlgorithmsLesson,
  'object-storage-s3':          ObjectStorageS3Lesson,
  'queue-sqs':                  QueueSqsLesson,
  'serverless-lambda':          ServerlessLambdaLesson,
  'primary-keys-foreign-keys':  PrimaryKeysForeignKeysLesson,
  pointers:                     PointersLesson,
}
