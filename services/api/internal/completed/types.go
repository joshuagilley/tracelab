package completed

import "strings"

// SubmittedFile is one file from the client practice submission.
type SubmittedFile struct {
	Name    string `json:"name"`
	Content string `json:"content"`
}

// SubmitPracticeRequest is the decoded POST /api/completed/submit body.
type SubmitPracticeRequest struct {
	Lab      string          `json:"lab"`
	Slug     string          `json:"slug"`
	Language string          `json:"language,omitempty"`
	Files    []SubmittedFile `json:"files"`
}

func (r SubmitPracticeRequest) validate() error {
	if r.Lab == "" || r.Slug == "" {
		return ErrLabAndSlugRequired
	}
	if len(r.Files) == 0 {
		return ErrFilesRequired
	}
	switch normalizedLanguage(r.Language) {
	case "go":
		if _, ok := pickSubmittedFile(r.Files, "main.go"); !ok {
			return ErrMainGoRequired
		}
	case "python":
		if _, ok := pickSubmittedFile(r.Files, "main.py"); !ok {
			return ErrMainPyRequired
		}
	case "typescript":
		if _, ok := pickSubmittedFile(r.Files, "main.ts"); !ok {
			return ErrMainTSRequired
		}
	default:
		return ErrUnsupportedLanguage
	}
	return nil
}

func normalizedLanguage(raw string) string {
	switch v := raw; v {
	case "":
		return "go"
	}
	switch lower := normalizeToken(raw); lower {
	case "go":
		return "go"
	case "py", "python":
		return "python"
	case "ts", "typescript":
		return "typescript"
	default:
		return lower
	}
}

func normalizeToken(raw string) string {
	s := raw
	s = strings.TrimSpace(s)
	s = strings.ToLower(s)
	return s
}
