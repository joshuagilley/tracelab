package completed

import (
	"context"
	"errors"
	"strings"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
)

// CanonicalPracticeFiles holds canonical test and module sources from Mongo practice.files.
type CanonicalPracticeFiles struct {
	GoMod string
	Test  string // main_test.go or first *_test.go
}

type practiceDoc struct {
	Practice struct {
		Files []SubmittedFile `bson:"files"`
	} `bson:"practice"`
}

// PracticeRepository loads canonical practice file contents from Concepts.
type PracticeRepository struct {
	coll *mongo.Collection
}

func NewPracticeRepository(coll *mongo.Collection) *PracticeRepository {
	return &PracticeRepository{coll: coll}
}

// FetchCanonicalFiles returns go.mod and test source from the concept's embedded practice bundle.
func (r *PracticeRepository) FetchCanonicalFiles(ctx context.Context, lab, slug string) (CanonicalPracticeFiles, error) {
	conceptID := lab + "/" + slug
	var doc practiceDoc
	if err := r.coll.FindOne(ctx, bson.M{"_id": conceptID}).Decode(&doc); err != nil {
		if errors.Is(err, mongo.ErrNoDocuments) {
			return CanonicalPracticeFiles{}, ErrPracticeNotFound
		}
		return CanonicalPracticeFiles{}, err
	}

	var out CanonicalPracticeFiles
	for _, f := range doc.Practice.Files {
		base := normalizedBaseName(f.Name)
		switch {
		case base == "go.mod":
			out.GoMod = f.Content
		case base == "main_test.go":
			out.Test = f.Content
		case strings.HasSuffix(base, "_test.go") && out.Test == "":
			out.Test = f.Content
		}
	}
	if out.Test == "" {
		return CanonicalPracticeFiles{}, ErrNoTestFileInPractice
	}
	return out, nil
}
