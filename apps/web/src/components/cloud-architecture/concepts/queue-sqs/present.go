package queuesqs

const Outline = `
Healthy queue pattern:

  Main queue: visibility timeout > max processing time
  DLQ: maxReceiveCount = 3 → poison messages land for inspection
  Consumer: idempotent handler (same message twice should be safe)
  Alarms: DLQ depth > 0 pages on-call

Producer never blocks on slow consumers — backlog grows, workers scale out.
`
