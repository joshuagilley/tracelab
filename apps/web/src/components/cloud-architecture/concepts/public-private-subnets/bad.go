package publicprivate

const BadOutline = `
Anti-pattern: run app + database in PUBLIC subnets because "it's easier to SSH"

  • Database security group opens 5432 to 0.0.0.0/0
  • Developers share one keypair on every instance
  • No NAT — instances use public IPs directly

Result: every instance is on the hot path for scanners and password sprays.
`
