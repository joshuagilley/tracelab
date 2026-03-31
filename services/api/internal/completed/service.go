package completed

import (
	"context"
	"errors"
	"net/http"
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

// PracticeSource loads canonical practice files for a lab/slug.
type PracticeSource interface {
	FetchCanonicalFiles(ctx context.Context, lab, slug, language string) (CanonicalPracticeFiles, error)
}

type completionWriter interface {
	Complete(ctx context.Context, userID primitive.ObjectID, lab, slug, language string) (time.Time, []string, error)
}

// Service orchestrates practice submission: load canonical tests, run checks, persist completion.
type Service struct {
	completions completionWriter
	practice    PracticeSource
	runner      Runner
}

func NewService(completions completionWriter, practice PracticeSource, runner Runner) *Service {
	return &Service{
		completions: completions,
		practice:    practice,
		runner:      runner,
	}
}

// SubmitResult is the outcome of a practice submission (before HTTP JSON shaping).
type SubmitResult struct {
	Passed      bool
	Completed   bool
	CompletedAt *time.Time
	Languages   []string
	Output      string
}

// Submit validates the request, runs tests, and marks completion when tests pass.
func (s *Service) Submit(ctx context.Context, userID primitive.ObjectID, req SubmitPracticeRequest) (SubmitResult, error) {
	if err := req.validate(); err != nil {
		return SubmitResult{}, err
	}

	language := normalizedLanguage(req.Language)
	mainCode, _ := pickSubmittedFile(req.Files, mainFileForLanguage(language))
	if language == "go" {
		mainCode = stripBuildConstraintsFromSubmittedMain(mainCode)
	}

	canon, err := s.practice.FetchCanonicalFiles(ctx, req.Lab, req.Slug, language)
	if err != nil {
		return SubmitResult{}, err
	}

	run, err := s.runner.Run(ctx, language, mainCode, canon)
	if err != nil {
		return SubmitResult{}, err
	}
	if !run.Passed {
		return SubmitResult{
			Passed:    false,
			Completed: false,
			Output:    run.Output,
		}, nil
	}

	completedAt, langs, err := s.completions.Complete(ctx, userID, req.Lab, req.Slug, language)
	if err != nil {
		return SubmitResult{}, err
	}
	t := completedAt.UTC()
	return SubmitResult{
		Passed:      true,
		Completed:   true,
		CompletedAt: &t,
		Languages:   langs,
		Output:      run.Output,
	}, nil
}

// MapSubmitError classifies service/repository errors for HTTP mapping.
func MapSubmitError(err error) (status int, code string, logErr bool) {
	switch {
	case err == nil:
		return 0, "", false
	case errors.Is(err, ErrLabAndSlugRequired):
		return http.StatusBadRequest, "lab_and_slug_required", false
	case errors.Is(err, ErrFilesRequired):
		return http.StatusBadRequest, "files_required", false
	case errors.Is(err, ErrMainGoRequired):
		return http.StatusBadRequest, "main_go_required", false
	case errors.Is(err, ErrMainPyRequired):
		return http.StatusBadRequest, "main_py_required", false
	case errors.Is(err, ErrMainTSRequired):
		return http.StatusBadRequest, "main_ts_required", false
	case errors.Is(err, ErrUnsupportedLanguage):
		return http.StatusBadRequest, "unsupported_language", false
	case errors.Is(err, ErrPracticeNotFound):
		return http.StatusNotFound, "practice_not_found", false
	case errors.Is(err, ErrNoTestFileInPractice):
		return http.StatusNotFound, "practice_not_found", true
	default:
		return http.StatusInternalServerError, "internal_error", true
	}
}
