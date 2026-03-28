package loadbalancer

const Outline = `
L4 (network) load balancer
  • Balances TCP/UDP connections with minimal inspection
  • Fast, generic — use when you do not need HTTP routing

L7 (application) load balancer
  • Understands HTTP(S): host header, path, cookies
  • TLS termination at the edge, health checks on /healthz

Typical stack:
  Client --TLS--> ALB (L7) --plain HTTP--> targets in private subnets
  Health: HTTP GET /ready → 200 or drain instance
`
