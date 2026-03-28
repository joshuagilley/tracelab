import type { CurriculumNavSection } from '@/types/curriculumNav'

/**
 * Memory, CPU, OS, and C — what actually happens under the hood. Lessons use C
 * (`present.c` / `bad.c`) with minimal abstraction. Higher-level scheduling and
 * Go concurrency live under Concurrency; distributed scale under System Design.
 */
export const LOW_LEVEL_SYSTEMS_SECTIONS: CurriculumNavSection[] = [
  {
    id: 'memory-fundamentals',
    title: 'Memory fundamentals',
    blurb:
      'The base layer: addresses, stack vs heap, and how a process sees RAM — foundation for understanding Go’s stack and escape analysis later.',
    items: [
      { label: 'What is memory?' },
      { label: 'Stack vs heap' },
      { label: 'Pointers', slug: 'pointers' },
      { label: 'Pointer arithmetic' },
      { label: 'Memory layout of a program (text, data, heap, stack)' },
    ],
  },
  {
    id: 'data-representation',
    title: 'Data representation',
    blurb: 'How values sit in bytes — endianness, alignment, and why `struct` size isn’t always what you expect.',
    items: [
      { label: 'Bits and bytes' },
      { label: 'Integers and overflow' },
      { label: 'Endianness' },
      { label: 'Structs and memory alignment' },
      { label: 'Padding and packing' },
    ],
  },
  {
    id: 'manual-memory',
    title: 'Manual memory management',
    blurb: 'Where C is explicit: allocation, lifetime bugs, and heap fragmentation.',
    items: [
      { label: 'malloc and free' },
      { label: 'Memory leaks' },
      { label: 'Dangling pointers' },
      { label: 'Double free errors' },
      { label: 'Fragmentation' },
    ],
  },
  {
    id: 'low-level-concurrency',
    title: 'Low-level concurrency',
    blurb:
      'Threads and locks without a managed runtime — complements Concurrency (goroutines, channels) with the pthreads / shared-memory picture.',
    items: [
      { label: 'Threads (pthreads)' },
      { label: 'Race conditions in C' },
      { label: 'Mutexes (C)' },
      { label: 'Shared memory' },
    ],
  },
  {
    id: 'cpu-execution',
    title: 'CPU & execution',
    blurb: 'From source to running instructions: compilation, processes, and the call stack.',
    items: [
      { label: 'Compilation process (C → assembly → binary)' },
      { label: 'What is a process?' },
      { label: 'What is a thread?' },
      { label: 'Function calls & stack frames' },
      { label: 'Instruction execution (high-level)' },
    ],
  },
  {
    id: 'files-io',
    title: 'Files & I/O',
    blurb: 'How user space talks to the kernel for bytes on disk and streams.',
    items: [
      { label: 'Reading and writing files' },
      { label: 'File descriptors' },
      { label: 'Buffered vs unbuffered I/O' },
      { label: 'Standard input / output' },
    ],
  },
  {
    id: 'os-concepts',
    title: 'Operating system concepts',
    blurb:
      'OS-level view of processes, syscalls, and virtual memory — bridges to Cloud Architecture (VMs, containers) and system performance intuition.',
    items: [
      { label: 'Processes vs threads (OS view)' },
      { label: 'Context switching' },
      { label: 'System calls' },
      { label: 'Virtual memory' },
      { label: 'Paging' },
    ],
  },
  {
    id: 'debugging-tooling',
    title: 'Debugging & tooling',
    blurb: 'Practical skills when there’s no safety net — segfaults, cores, and memory checkers.',
    items: [
      { label: 'Using gdb' },
      { label: 'Valgrind (memory debugging)' },
      { label: 'Segmentation faults' },
      { label: 'Core dumps' },
    ],
  },
]

export const LOW_LEVEL_SYSTEMS_DEFAULT_OPEN = [] as const
