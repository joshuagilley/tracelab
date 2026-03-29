package objectstorage

const Outline = `
Good object-storage posture (S3-style):

  • Bucket is private; Block Public Access enabled
  • Application role: s3:GetObject + s3:PutObject scoped to prefix "uploads/{tenant}/*"
  • Versioning ON for recovery; lifecycle rule → IA/Glacier for old versions
  • Sensitive downloads via short-lived pre-signed URLs, not public ACLs
`
