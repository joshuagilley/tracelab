package completed

import (
	"context"
	"errors"
	"strings"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
)

// CanonicalPracticeFiles holds canonical test and module sources from Mongo practice.
type CanonicalPracticeFiles struct {
	Language       string
	MainFileName   string
	TestFileName   string
	Test           string
	ModuleFileName string
	Module         string
}

type practiceDoc struct {
	Practice struct {
		Files     []SubmittedFile `bson:"files"`
		Languages []struct {
			Type  string          `bson:"type"`
			Files []SubmittedFile `bson:"files"`
		} `bson:"languages"`
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
func (r *PracticeRepository) FetchCanonicalFiles(
	ctx context.Context,
	lab, slug, language string,
) (CanonicalPracticeFiles, error) {
	conceptID := lab + "/" + slug
	var doc practiceDoc
	if err := r.coll.FindOne(ctx, bson.M{"_id": conceptID}).Decode(&doc); err != nil {
		if errors.Is(err, mongo.ErrNoDocuments) {
			return CanonicalPracticeFiles{}, ErrPracticeNotFound
		}
		return CanonicalPracticeFiles{}, err
	}

	files := doc.Practice.Files
	if len(doc.Practice.Languages) > 0 {
		want := normalizedLanguage(language)
		for _, bundle := range doc.Practice.Languages {
			if normalizedLanguage(bundle.Type) == want {
				files = bundle.Files
				break
			}
		}
	}

	out := CanonicalPracticeFiles{
		Language:     normalizedLanguage(language),
		MainFileName: mainFileForLanguage(normalizedLanguage(language)),
		TestFileName: testFileForLanguage(normalizedLanguage(language)),
	}

	for _, f := range files {
		base := normalizedBaseName(f.Name)
		switch {
		case base == "go.mod":
			out.ModuleFileName = "go.mod"
			out.Module = f.Content
		case base == "requirements.txt":
			out.ModuleFileName = "requirements.txt"
			out.Module = f.Content
		case base == "package.json":
			out.ModuleFileName = "package.json"
			out.Module = f.Content
		case base == "main_test.go":
			out.TestFileName = "main_test.go"
			out.Test = f.Content
		case strings.HasSuffix(base, "_test.go") && out.Test == "" && out.Language == "go":
			out.Test = f.Content
			out.TestFileName = base
		case base == "test_main.py":
			out.TestFileName = "test_main.py"
			out.Test = f.Content
		case strings.HasPrefix(base, "test_") && strings.HasSuffix(base, ".py") && out.Test == "" && out.Language == "python":
			out.TestFileName = base
			out.Test = f.Content
		case base == "main.test.ts":
			out.TestFileName = "main.test.ts"
			out.Test = f.Content
		case strings.HasSuffix(base, ".test.ts") && out.Test == "" && out.Language == "typescript":
			out.TestFileName = base
			out.Test = f.Content
		}
	}
	if out.Test == "" {
		return CanonicalPracticeFiles{}, ErrNoTestFileInPractice
	}
	return out, nil
}

func mainFileForLanguage(language string) string {
	switch language {
	case "python":
		return "main.py"
	case "typescript":
		return "main.ts"
	default:
		return "main.go"
	}
}

func testFileForLanguage(language string) string {
	switch language {
	case "python":
		return "test_main.py"
	case "typescript":
		return "main.test.ts"
	default:
		return "main_test.go"
	}
}
