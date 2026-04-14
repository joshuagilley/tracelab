package completed

import (
	"path"
	"strings"
)

// normalizedBaseName returns the last path segment with Windows separators normalized to "/".
func normalizedBaseName(name string) string {
	return path.Base(strings.ReplaceAll(name, "\\", "/"))
}

func pickSubmittedFile(files []SubmittedFile, target string) (string, bool) {
	for _, f := range files {
		if normalizedBaseName(f.Name) == target {
			return f.Content, true
		}
	}
	return "", false
}

// mainFileForLanguage is the conventional entry filename for submit (after normalizedLanguage).
func mainFileForLanguage(language string) string {
	switch language {
	case "go":
		return "main.go"
	case "python":
		return "main.py"
	case "typescript":
		return "main.ts"
	default:
		return ""
	}
}

// stripBuildConstraintsFromSubmittedMain removes leading //go:build / // +build lines so
// pasted solution stubs still compile under go test.
func stripBuildConstraintsFromSubmittedMain(src string) string {
	lines := strings.Split(src, "\n")
	i := 0
	for i < len(lines) {
		s := strings.TrimSpace(lines[i])
		if s == "" {
			i++
			continue
		}
		if strings.HasPrefix(s, "//go:build") || strings.HasPrefix(s, "// +build") {
			i++
			continue
		}
		break
	}
	return strings.Join(lines[i:], "\n")
}
