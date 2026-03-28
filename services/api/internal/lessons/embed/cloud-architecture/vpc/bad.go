package vpc

// BadOutline is an anti-pattern: one flat subnet and everything reachable from the internet.
const BadOutline = `
Anti-pattern: one flat subnet, everything reachable from the internet.

VPC 10.0.0.0/8   # absurdly large, no segmentation
└── subnet-all   10.0.0.0/24
    ├── web + API + workers + database + cache (all mixed)
    └── SecurityGroup: 0.0.0.0/0 allow ALL ports "for now"

Why this hurts:
• Blast radius: compromise one host → lateral movement everywhere.
• You cannot reason about routes or compliance boundaries.
• Scaling one tier forces touching the whole network layout.
`
