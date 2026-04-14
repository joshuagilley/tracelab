package labstorage

import (
	"context"
	"errors"
	"strings"

	"go.mongodb.org/mongo-driver/bson"

	"github.com/tracelab/api/internal/labconfig"
	"github.com/tracelab/api/internal/practicefiles"
)

// Service reads lab file trees from GCS using practice metadata (bson.M) from Mongo.
type Service struct {
	reader        *GCSReader
	defaultBucket string
	// labsAllow optional: when set, GCS reads only basenames listed for each language (Config labs).
	labsAllow *labconfig.LabsAllowlist
}

func NewService(reader *GCSReader, defaultBucket string, labsAllow *labconfig.LabsAllowlist) *Service {
	return &Service{
		reader:        reader,
		defaultBucket: strings.TrimSpace(defaultBucket),
		labsAllow:     labsAllow,
	}
}

func (s *Service) Enabled() bool {
	return s != nil && s.reader != nil && s.defaultBucket != ""
}

// ReadPracticeFiles loads every file under the gcs prefix for this practice document and language.
func (s *Service) ReadPracticeFiles(ctx context.Context, practice bson.M, language string) ([]practicefiles.File, error) {
	if !s.Enabled() {
		return nil, errors.New("lab GCS not configured")
	}
	bucket := BucketName(practice, s.defaultBucket)
	if bucket == "" {
		return nil, errors.New("empty bucket")
	}
	lang := practicefiles.NormalizeLanguage(language)
	prefix, err := ObjectPrefix(practice, lang)
	if err != nil {
		return nil, err
	}
	allowed := s.labsAllow.Basenames(lang)
	return s.reader.ReadAllFiles(ctx, bucket, prefix, allowed)
}
