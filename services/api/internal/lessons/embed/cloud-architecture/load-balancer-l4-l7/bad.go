package loadbalancer

const BadOutline = `
Anti-pattern: DNS round-robin to three public IPs with no health checks

  • One crashed node still receives ~33% of traffic → user-facing errors
  • No TLS termination — each app implements certs inconsistently
  • Sticky sessions via client-side hacks instead of managed cookies

Use a real LB with targets, health checks, and optional L7 rules.
`
