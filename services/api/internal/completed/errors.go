package completed

import "errors"

var (
	ErrPracticeNotFound      = errors.New("practice not found")
	ErrNoTestFileInPractice  = errors.New("no test file in practice config")
	ErrMainGoRequired        = errors.New("main.go required")
	ErrLabAndSlugRequired    = errors.New("lab and slug required")
	ErrFilesRequired         = errors.New("at least one file required")
)
