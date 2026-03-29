// Local sandbox — self-contained runnable main (not served by the API).
// Canonical lesson code: apps/web/src/components/design-patterns/advanced/dependency-injection/present.go
//
//	cd labs/design-patterns && go run ./sandbox/dependency-injection
package main

import (
	"context"
	"fmt"
)

type ObjectUploader interface {
	Put(ctx context.Context, key string, data []byte) error
}

type IngestService struct {
	uploader ObjectUploader
}

func NewIngestService(u ObjectUploader) *IngestService {
	return &IngestService{uploader: u}
}

func (s *IngestService) SaveExport(ctx context.Context, name string, payload []byte) error {
	return s.uploader.Put(ctx, "exports/"+name, payload)
}

type NoopUploader struct{}

func (NoopUploader) Put(ctx context.Context, key string, data []byte) error {
	return nil
}

type printUploader struct {
	label string
}

func (p *printUploader) Put(ctx context.Context, key string, data []byte) error {
	fmt.Printf("[%s] Put key=%q (%d bytes)\n", p.label, key, len(data))
	return nil
}

func main() {
	ctx := context.Background()

	fmt.Println("=== Dependency injection demo: swap uploaders, same service API ===")
	fmt.Println()

	mock := &printUploader{label: "mock-backend"}
	svc := NewIngestService(mock)
	fmt.Println("Service wired with mock-backend:")
	_ = svc.SaveExport(ctx, "report.csv", []byte("a,b,c"))

	sftp := &printUploader{label: "sftp-bridge"}
	svc2 := NewIngestService(sftp)
	fmt.Println()
	fmt.Println("New service wired with sftp-bridge (SaveExport code unchanged):")
	_ = svc2.SaveExport(ctx, "report.csv", []byte("x,y,z"))

	fmt.Println()
	fmt.Println("NoopUploader (injected like any other implementation):")
	silent := NewIngestService(NoopUploader{})
	_ = silent.SaveExport(ctx, "quiet.bin", []byte("payload"))
	fmt.Println("(No output — NoopUploader discards writes.)")
}
