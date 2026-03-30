package completed

// SubmittedFile is one file from the client practice submission.
type SubmittedFile struct {
	Name    string `json:"name"`
	Content string `json:"content"`
}

// SubmitPracticeRequest is the decoded POST /api/completed/submit body.
type SubmitPracticeRequest struct {
	Lab   string          `json:"lab"`
	Slug  string          `json:"slug"`
	Files []SubmittedFile `json:"files"`
}

func (r SubmitPracticeRequest) validate() error {
	if r.Lab == "" || r.Slug == "" {
		return ErrLabAndSlugRequired
	}
	if len(r.Files) == 0 {
		return ErrFilesRequired
	}
	if _, ok := pickSubmittedFile(r.Files, "main.go"); !ok {
		return ErrMainGoRequired
	}
	return nil
}
