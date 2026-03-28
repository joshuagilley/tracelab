import type { CurriculumNavSection } from '@/types/curriculumNav'

/** How software is built, shipped, and run — workflow and release mechanics beyond raw cloud resources (Cloud Architecture). */
export const DEVOPS_SECTIONS: CurriculumNavSection[] = [
  {
    id: 'delivery',
    title: 'Delivery',
    blurb: 'Automation from commit to artifact — the spine of reliable releases.',
    items: [
      { label: 'CI/CD pipelines' },
      { label: 'Git workflows' },
    ],
  },
  {
    id: 'runtime',
    title: 'Runtime & orchestration',
    blurb: 'Packaging and scheduling workloads — connects to containers and Kubernetes topics in cloud tracks.',
    items: [
      { label: 'Docker deep dive' },
      { label: 'Kubernetes basics' },
    ],
  },
  {
    id: 'releases',
    title: 'Releases',
    blurb: 'Changing production safely and rolling back when signals go wrong.',
    items: [
      { label: 'Deployments (blue/green, canary)' },
      { label: 'Rollbacks' },
    ],
  },
]

export const DEVOPS_DEFAULT_OPEN = ['delivery', 'runtime'] as const
