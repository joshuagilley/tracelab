package completed

import (
	"context"
	"errors"
	"strings"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"

	"github.com/tracelab/api/internal/labstorage"
	"github.com/tracelab/api/internal/practicefiles"
)

// CanonicalPracticeFiles holds canonical test and module sources for the submit runner.
type CanonicalPracticeFiles struct {
	Language       string
	MainFileName   string
	TestFileName   string
	Test           string
	ModuleFileName string
	Module         string
}

type practiceEmbedded struct {
	Files []SubmittedFile `bson:"files"`
	Languages []struct {
		Type  string          `bson:"type"`
		Files []SubmittedFile `bson:"files"`
	} `bson:"languages"`
}

// PracticeRepository loads canonical practice file contents from Concepts (embedded) or GCS.
type PracticeRepository struct {
	coll *mongo.Collection
	labs *labstorage.Service
}

func NewPracticeRepository(coll *mongo.Collection, labs *labstorage.Service) *PracticeRepository {
	return &PracticeRepository{coll: coll, labs: labs}
}

// FetchCanonicalFiles returns module + test sources for the given lab/slug/language.
func (r *PracticeRepository) FetchCanonicalFiles(
	ctx context.Context,
	lab, slug, language string,
) (CanonicalPracticeFiles, error) {
	conceptID := lab + "/" + slug
	var doc bson.M
	if err := r.coll.FindOne(ctx, bson.M{"_id": conceptID}).Decode(&doc); err != nil {
		if errors.Is(err, mongo.ErrNoDocuments) {
			return CanonicalPracticeFiles{}, ErrPracticeNotFound
		}
		return CanonicalPracticeFiles{}, err
	}
	practice, ok := doc["practice"].(bson.M)
	if !ok || practice == nil {
		return CanonicalPracticeFiles{}, ErrPracticeNotFound
	}

	if r.labs != nil && r.labs.Enabled() {
		if st, _ := practice["storage"].(string); strings.EqualFold(strings.TrimSpace(st), "gcs") {
			files, err := r.labs.ReadPracticeFiles(ctx, practice, language)
			if err != nil {
				return CanonicalPracticeFiles{}, err
			}
			canon, err := practicefiles.ToCanon(files, language)
			if err != nil {
				if errors.Is(err, practicefiles.ErrNoTestFile) {
					return CanonicalPracticeFiles{}, ErrNoTestFileInPractice
				}
				return CanonicalPracticeFiles{}, err
			}
			return canonToCompleted(canon), nil
		}
	}

	// Legacy: embedded file bodies on the concept (omit once practice.storage is gcs and blobs are stripped).
	var pe practiceEmbedded
	b, err := bson.Marshal(practice)
	if err != nil {
		return CanonicalPracticeFiles{}, err
	}
	if err := bson.Unmarshal(b, &pe); err != nil {
		return CanonicalPracticeFiles{}, err
	}

	files := pe.Files
	if len(pe.Languages) > 0 {
		want := normalizedLanguage(language)
		for _, bundle := range pe.Languages {
			if normalizedLanguage(bundle.Type) == want {
				files = bundle.Files
				break
			}
		}
	}

	flat := make([]practicefiles.File, 0, len(files))
	for _, f := range files {
		flat = append(flat, practicefiles.File{Name: f.Name, Content: f.Content})
	}
	canon, err := practicefiles.ToCanon(flat, language)
	if err != nil {
		if errors.Is(err, practicefiles.ErrNoTestFile) {
			return CanonicalPracticeFiles{}, ErrNoTestFileInPractice
		}
		return CanonicalPracticeFiles{}, err
	}
	return canonToCompleted(canon), nil
}

func canonToCompleted(c practicefiles.Canon) CanonicalPracticeFiles {
	return CanonicalPracticeFiles{
		Language:       c.Language,
		MainFileName:   c.MainFileName,
		TestFileName:   c.TestFileName,
		Test:           c.Test,
		ModuleFileName: c.ModuleFileName,
		Module:         c.Module,
	}
}
