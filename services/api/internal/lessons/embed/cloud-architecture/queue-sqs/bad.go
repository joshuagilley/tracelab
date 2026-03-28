package queuesqs

const BadOutline = `
Anti-patterns:

  • No DLQ — one bad JSON blocks the queue forever after max retries loop
  • Visibility timeout = 5s but job takes 60s → duplicate processing storms
  • Consumer deletes message before commit → data loss on crash
  • Polling with sleep(0) in a tight loop → burn $ and CPU
`
