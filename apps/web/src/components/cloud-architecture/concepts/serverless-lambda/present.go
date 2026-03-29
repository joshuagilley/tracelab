package serverless

const Outline = `
Good Lambda habits:

  • Handler reads configuration from env populated by IaC (ARN of secret, not value)
  • At cold start: fetch secret once, cache in /tmp if allowed by threat model
  • IAM role: least privilege — invoke one queue, read one parameter
  • Idempotency key from event id for downstream writes
  • Timeout and memory sized from p99 measurements, not defaults
`
