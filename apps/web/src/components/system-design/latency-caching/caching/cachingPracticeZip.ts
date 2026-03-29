import { strToU8, zipSync } from 'fflate'

/** One folder in the zip: main.go, go.mod, README — nothing nested like repo paths. */
const FOLDER = 'caching-practice'

const README = `# TraceLab — Caching (local practice)

## Install Go
1. **https://go.dev/dl/** — install for your OS.
2. Check: \`go version\`

## Run
\`\`\`bash
cd caching-practice
go run .
\`\`\`

Standard library only to start; run \`go mod tidy\` if you add modules later.

## Goal
Build a tiny **in-memory cache**: put something in, get it out, and **print** a line that shows it worked (value, or “hit” / “miss”, etc.). Stretch: TTL, eviction, concurrency — same ideas as the lesson.
`

const GO_MOD = `module caching-practice

go 1.22
`

const MAIN_GO = `// TraceLab — caching practice (package main so "go run ." works; lesson embed uses package caching).
//
// GOAL: Create a cache. Store a value, read it back, and fmt.Println something that shows it worked.
//
// Install Go: https://go.dev/dl/  →  go run .
package main

import (
	"container/list"
	"encoding/json"
	"fmt"
	"net/http"
	"sync"
	"time"
)

func main() {
	// Tiny references so these imports compile; remove once your cache uses them.
	_ = list.New().Len()
	_ = json.Valid([]byte("{}"))
	_ = http.MethodGet
	var mu sync.Mutex
	_ = mu
	_ = time.Now()

	fmt.Println("Hello — implement a cache and print something here.")
}
`

export function buildCachingPracticeZip(): Uint8Array {
  return zipSync({
    [`${FOLDER}/README.md`]: strToU8(README),
    [`${FOLDER}/go.mod`]: strToU8(GO_MOD),
    [`${FOLDER}/main.go`]: strToU8(MAIN_GO),
  })
}

export function downloadCachingPracticeZip(): void {
  const bytes = buildCachingPracticeZip()
  const blob = new Blob([new Uint8Array(bytes)], { type: 'application/zip' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'tracelab-caching-practice.zip'
  a.rel = 'noopener'
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}
