import { LessonPlaceholder } from '@/components/lesson-panels/LessonPanel'
import VpcLesson from './concepts/vpc/VpcLesson'
import PublicPrivateSubnetsLesson from './concepts/public-private-subnets/PublicPrivateSubnetsLesson'
import LoadBalancerL4L7Lesson from './concepts/load-balancer-l4-l7/LoadBalancerL4L7Lesson'
import ObjectStorageS3Lesson from './concepts/object-storage-s3/ObjectStorageS3Lesson'
import QueueSqsLesson from './concepts/queue-sqs/QueueSqsLesson'
import ServerlessLambdaLesson from './concepts/serverless-lambda/ServerlessLambdaLesson'

interface Props {
  summary: string
  slug: string
}

export default function CloudArchitectureLessonPanel({ summary, slug }: Props) {
  if (slug === 'vpc') return <VpcLesson summary={summary} />
  if (slug === 'public-private-subnets') return <PublicPrivateSubnetsLesson summary={summary} />
  if (slug === 'load-balancer-l4-l7') return <LoadBalancerL4L7Lesson summary={summary} />
  if (slug === 'object-storage-s3') return <ObjectStorageS3Lesson summary={summary} />
  if (slug === 'queue-sqs') return <QueueSqsLesson summary={summary} />
  if (slug === 'serverless-lambda') return <ServerlessLambdaLesson summary={summary} />
  return <LessonPlaceholder summary={summary} />
}
