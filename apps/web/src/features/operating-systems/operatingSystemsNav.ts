import type { CurriculumNavSection } from '@/types/curriculumNav'

/**
 * Interactive OS intuition: processes, memory, scheduling, files, shell.
 * Complements Low-Level Systems (C/syscalls detail) and Concurrency (Go in-process).
 */
export const OPERATING_SYSTEMS_SECTIONS: CurriculumNavSection[] = [
  {
    id: 'processes-threads',
    title: 'Processes & threads',
    blurb:
      'How programs execute and how the OS models concurrency — lifecycle, isolation, shared memory, and the cost of switching.',
    items: [
      { label: 'Process lifecycle' },
      { label: 'Process vs thread simulation', slug: 'process-vs-thread' },
      { label: 'Context switching cost', slug: 'context-switching-cost' },
      { label: 'Isolation vs shared memory' },
    ],
  },
  {
    id: 'memory',
    title: 'Memory',
    blurb:
      'Stack vs heap, allocation, leaks, virtual memory and paging — why services slow down or crash under pressure.',
    items: [
      { label: 'Stack vs heap', slug: 'stack-vs-heap-os' },
      { label: 'Memory leak simulator', slug: 'memory-leak-simulator' },
      { label: 'Virtual memory & paging', slug: 'virtual-memory-paging' },
    ],
  },
  {
    id: 'scheduling-concurrency',
    title: 'Scheduling & concurrency',
    blurb:
      'CPU scheduling, queues, fairness, starvation, deadlocks — tied to workers, backpressure, and real APIs.',
    items: [
      { label: 'Scheduling algorithms', slug: 'cpu-scheduling-algorithms' },
      { label: 'Queue system simulation', slug: 'queue-system-simulation' },
      { label: 'Deadlock simulator', slug: 'deadlock-simulator' },
    ],
  },
  {
    id: 'file-systems',
    title: 'File systems',
    blurb: 'Files, directories, descriptors, and disk I/O — foundations for logs and pipelines.',
    items: [
      { label: 'File tree explorer', slug: 'file-tree-explorer' },
      { label: 'Read/write & latency', slug: 'file-read-write-latency' },
    ],
  },
  {
    id: 'shell-orchestration',
    title: 'Shell & process orchestration',
    blurb: 'stdin/out/err, pipes, spawning, jobs — the same ideas as ETL and CI pipelines.',
    items: [
      { label: 'Pipe system', slug: 'pipe-system' },
      { label: 'Process tree & jobs', slug: 'process-tree-jobs' },
      { label: 'File descriptors & redirection', slug: 'file-descriptor-visualization' },
      { label: 'Shell pipeline builder', slug: 'shell-pipeline-builder' },
    ],
  },
  {
    id: 'flagship',
    title: 'Systems under load',
    blurb: 'Cross-cutting simulations tying OS behavior to services you operate.',
    items: [{ label: 'Why your API breaks under load', slug: 'api-breaks-under-load' }],
  },
]

export const OPERATING_SYSTEMS_DEFAULT_OPEN = ['processes-threads'] as const
