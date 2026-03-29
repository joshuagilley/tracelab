package serverless

const BadOutline = `
Anti-pattern handler (illustrative):

  const apiKey = "sk-live-1234567890" // committed to repo / env var in console screenshot
  http.Get("https://api.vendor.com/charge?key=" + apiKey)

Also common:
  • 15-minute timeout with synchronous calls to flaky HTTP APIs
  • Full VPC attachment for a function that only needs S3 — cold starts explode
`
