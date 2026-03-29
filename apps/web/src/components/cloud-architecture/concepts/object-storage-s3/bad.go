package objectstorage

const BadOutline = `
Anti-pattern bucket policy excerpt:

  "Principal": "*"
  "Action": "s3:GetObject"
  "Resource": "arn:aws:s3:::customer-uploads/*"

Anyone on the internet can crawl your customer-uploads bucket.
Also common: long-lived access keys committed to git for "quick demos".
`
