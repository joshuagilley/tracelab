package publicprivate

const Outline = `
PUBLIC subnet
  • Route table includes 0.0.0.0/0 → Internet Gateway
  • Good for: load balancers, bastion hosts (if you must), NAT gateways

PRIVATE subnet
  • No IGW route; optional 0.0.0.0/0 → NAT for outbound-only
  • Good for: app servers, workers, databases, internal services

Example flow:
  Internet → ALB (public) → EC2 (private-app) → RDS (private-db)
  EC2 can apt-get via NAT; RDS never sees the public internet.
`
