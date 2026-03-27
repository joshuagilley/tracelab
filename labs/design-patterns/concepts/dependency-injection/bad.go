//go:build ignore

// Anti-pattern: same nominal IngestService + SaveExport as present.go, but no IngestDeps or ObjectUploader.
// One config struct owns every transport’s keys; SaveExport switches on mode instead of delegating to an injected uploader.
package archivebad

import "context"

type SprawlConfig struct {
	Mode string // "sftp" | "webdav" | "mock"

	SFTPHost, SFTPUser, SFTPKey string
	WebURL, WebToken            string
	MockLastKey                 string
}

type IngestService struct {
	cfg SprawlConfig
}

func NewIngestService(cfg SprawlConfig) *IngestService {
	return &IngestService{cfg: cfg}
}

func (s *IngestService) SaveExport(ctx context.Context, name string, payload []byte) error {
	key := "exports/" + name
	switch s.cfg.Mode {
	case "mock":
		s.cfg.MockLastKey = key
		return nil
	case "webdav":
		return putWebDAV(ctx, key, payload, s.cfg.WebURL, s.cfg.WebToken)
	default:
		return putSFTP(ctx, key, payload, s.cfg.SFTPHost, s.cfg.SFTPUser, s.cfg.SFTPKey)
	}
}

func putSFTP(ctx context.Context, key string, data []byte, host, user, pem string) error {
	_ = ctx
	_ = key
	_ = data
	_ = host
	_ = user
	_ = pem
	return nil
}

func putWebDAV(ctx context.Context, key string, data []byte, url, token string) error {
	_ = ctx
	_ = key
	_ = data
	_ = url
	_ = token
	return nil
}
