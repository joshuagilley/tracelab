package archive

import "context"

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
