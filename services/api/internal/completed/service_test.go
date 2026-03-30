package completed

import (
	"context"
	"errors"
	"net/http"
	"testing"
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type stubPractice struct {
	files CanonicalPracticeFiles
	err   error
}

func (s *stubPractice) FetchCanonicalFiles(ctx context.Context, lab, slug string) (CanonicalPracticeFiles, error) {
	return s.files, s.err
}

type stubRunner struct {
	res RunResult
	err error
}

func (s *stubRunner) Run(ctx context.Context, mainCode string, canon CanonicalPracticeFiles) (RunResult, error) {
	return s.res, s.err
}

type stubCompletions struct {
	at  time.Time
	err error
}

func (s *stubCompletions) Complete(ctx context.Context, userID primitive.ObjectID, lab, slug string) (time.Time, error) {
	if s.err != nil {
		return time.Time{}, s.err
	}
	return s.at, nil
}

func TestService_Submit_validation(t *testing.T) {
	svc := NewService(&stubCompletions{}, &stubPractice{}, &stubRunner{})
	uid := primitive.NewObjectID()
	_, err := svc.Submit(context.Background(), uid, SubmitPracticeRequest{})
	if !errors.Is(err, ErrLabAndSlugRequired) {
		t.Fatalf("got %v", err)
	}

	_, err = svc.Submit(context.Background(), uid, SubmitPracticeRequest{Lab: "a", Slug: "b", Files: nil})
	if !errors.Is(err, ErrFilesRequired) {
		t.Fatalf("got %v", err)
	}

	_, err = svc.Submit(context.Background(), uid, SubmitPracticeRequest{
		Lab: "a", Slug: "b",
		Files: []SubmittedFile{{Name: "x.txt", Content: "y"}},
	})
	if !errors.Is(err, ErrMainGoRequired) {
		t.Fatalf("got %v", err)
	}
}

func TestService_Submit_runnerFailNoComplete(t *testing.T) {
	completedAt := time.Date(2020, 1, 2, 3, 4, 5, 0, time.UTC)
	store := &stubCompletions{at: completedAt}
	svc := NewService(store, &stubPractice{
		files: CanonicalPracticeFiles{GoMod: "m", Test: "t"},
	}, &stubRunner{res: RunResult{Output: "fail", Passed: false}})
	uid := primitive.NewObjectID()
	res, err := svc.Submit(context.Background(), uid, SubmitPracticeRequest{
		Lab: "l", Slug: "s",
		Files: []SubmittedFile{{Name: "main.go", Content: "package main\nfunc main(){}\n"}},
	})
	if err != nil {
		t.Fatal(err)
	}
	if res.Passed || res.Completed || res.CompletedAt != nil {
		t.Fatalf("%+v", res)
	}
	if res.Output != "fail" {
		t.Fatalf("output %q", res.Output)
	}
}

func TestService_Submit_passMarksComplete(t *testing.T) {
	completedAt := time.Date(2020, 1, 2, 3, 4, 5, 0, time.UTC)
	store := &stubCompletions{at: completedAt}
	svc := NewService(store, &stubPractice{
		files: CanonicalPracticeFiles{GoMod: "m", Test: "t"},
	}, &stubRunner{res: RunResult{Output: "ok", Passed: true}})
	uid := primitive.NewObjectID()
	res, err := svc.Submit(context.Background(), uid, SubmitPracticeRequest{
		Lab: "l", Slug: "s",
		Files: []SubmittedFile{{Name: "main.go", Content: "package main\nfunc main(){}\n"}},
	})
	if err != nil {
		t.Fatal(err)
	}
	if !res.Passed || !res.Completed || res.CompletedAt == nil {
		t.Fatalf("%+v", res)
	}
}

func TestService_Submit_practiceNotFound(t *testing.T) {
	svc := NewService(&stubCompletions{}, &stubPractice{err: ErrPracticeNotFound}, &stubRunner{})
	uid := primitive.NewObjectID()
	_, err := svc.Submit(context.Background(), uid, SubmitPracticeRequest{
		Lab: "l", Slug: "s",
		Files: []SubmittedFile{{Name: "main.go", Content: "x"}},
	})
	if !errors.Is(err, ErrPracticeNotFound) {
		t.Fatalf("got %v", err)
	}
}

func TestMapSubmitError(t *testing.T) {
	st, code, log := MapSubmitError(ErrMainGoRequired)
	if st != http.StatusBadRequest || code != "main_go_required" || log {
		t.Fatalf("%d %q log=%v", st, code, log)
	}
	st, code, log = MapSubmitError(ErrPracticeNotFound)
	if st != http.StatusNotFound || code != "practice_not_found" || log {
		t.Fatalf("%d %q log=%v", st, code, log)
	}
	st, code, log = MapSubmitError(ErrNoTestFileInPractice)
	if st != http.StatusNotFound || code != "practice_not_found" || !log {
		t.Fatalf("%d %q log=%v", st, code, log)
	}
}
