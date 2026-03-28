package vpc

// Outline documents a minimal healthy VPC layout (illustrative; not provider-specific API calls).
const Outline = `
VPC 10.0.0.0/16
├── public-1a   10.0.1.0/24   route 0.0.0.0/0 → Internet Gateway
├── public-1b   10.0.2.0/24   (second AZ for HA load balancer)
├── private-app 10.0.10.0/24  default route → NAT Gateway (lives in public)
└── private-db  10.0.20.0/24  NO 0.0.0.0/0 route — only SG access from private-app

Rules of thumb:
• Put databases and internal APIs in private subnets.
• NAT gives outbound-only internet for patches; inbound stays closed.
• Use separate subnets per tier so route tables stay simple.
`
