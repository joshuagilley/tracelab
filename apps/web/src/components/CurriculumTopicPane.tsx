import TopicSidebarNav from './TopicSidebarNav'
import { ALGORITHMS_DEFAULT_OPEN, ALGORITHMS_SECTIONS } from '@/features/algorithms/algorithmsNav'
import { AI_SYSTEMS_DEFAULT_OPEN, AI_SYSTEMS_SECTIONS } from '@/features/ai-systems/aiSystemsNav'
import { CONCURRENCY_DEFAULT_OPEN, CONCURRENCY_SECTIONS } from '@/features/concurrency/concurrencyNav'
import { DEVOPS_DEFAULT_OPEN, DEVOPS_SECTIONS } from '@/features/devops/devopsNav'
import { NETWORKING_DEFAULT_OPEN, NETWORKING_SECTIONS } from '@/features/networking/networkingNav'
import { SECURITY_DEFAULT_OPEN, SECURITY_SECTIONS } from '@/features/security/securityNav'
import {
  SOFTWARE_ARCHITECTURE_DEFAULT_OPEN,
  SOFTWARE_ARCHITECTURE_SECTIONS,
} from '@/features/software-architecture/softwareArchitectureNav'
import { TESTING_DEFAULT_OPEN, TESTING_SECTIONS } from '@/features/testing/testingNav'
import type { LabId } from '@/contexts/lab'
import type { Concept } from '@/types/concept'

interface Props {
  labId: LabId
  concepts: Concept[]
}

/** Topic-based curriculum sidebars (accordion sections + Soon / available rows). */
export default function CurriculumTopicPane({ labId, concepts }: Props) {
  switch (labId) {
    case 'concurrency':
      return (
        <TopicSidebarNav
          concepts={concepts}
          sections={CONCURRENCY_SECTIONS}
          panelPrefix="conc"
          defaultOpenSectionIds={[...CONCURRENCY_DEFAULT_OPEN]}
        />
      )
    case 'networking':
      return (
        <TopicSidebarNav
          concepts={concepts}
          sections={NETWORKING_SECTIONS}
          panelPrefix="net"
          defaultOpenSectionIds={[...NETWORKING_DEFAULT_OPEN]}
        />
      )
    case 'security':
      return (
        <TopicSidebarNav
          concepts={concepts}
          sections={SECURITY_SECTIONS}
          panelPrefix="sec"
          defaultOpenSectionIds={[...SECURITY_DEFAULT_OPEN]}
        />
      )
    case 'software-architecture':
      return (
        <TopicSidebarNav
          concepts={concepts}
          sections={SOFTWARE_ARCHITECTURE_SECTIONS}
          panelPrefix="swa"
          defaultOpenSectionIds={[...SOFTWARE_ARCHITECTURE_DEFAULT_OPEN]}
        />
      )
    case 'testing':
      return (
        <TopicSidebarNav
          concepts={concepts}
          sections={TESTING_SECTIONS}
          panelPrefix="tst"
          defaultOpenSectionIds={[...TESTING_DEFAULT_OPEN]}
        />
      )
    case 'devops':
      return (
        <TopicSidebarNav
          concepts={concepts}
          sections={DEVOPS_SECTIONS}
          panelPrefix="dvo"
          defaultOpenSectionIds={[...DEVOPS_DEFAULT_OPEN]}
        />
      )
    case 'ai-systems':
      return (
        <TopicSidebarNav
          concepts={concepts}
          sections={AI_SYSTEMS_SECTIONS}
          panelPrefix="ai"
          defaultOpenSectionIds={[...AI_SYSTEMS_DEFAULT_OPEN]}
        />
      )
    case 'algorithms':
      return (
        <TopicSidebarNav
          concepts={concepts}
          sections={ALGORITHMS_SECTIONS}
          panelPrefix="alg"
          defaultOpenSectionIds={[...ALGORITHMS_DEFAULT_OPEN]}
        />
      )
    default:
      return null
  }
}
