package practicefiles

import (
	"errors"
	"strings"
)

// File is a named practice source blob (path may be "main.go" or "go/main.go").
type File struct {
	Name    string
	Content string
}

// Canon is the subset of sources the submit runner needs from the canonical bundle.
type Canon struct {
	Language       string
	MainFileName   string
	TestFileName   string
	Test           string
	ModuleFileName string
	Module         string
}

var ErrNoTestFile = errors.New("no test file in practice bundle")

// ToCanon picks module + test sources from a bundle for the submit runner.
func ToCanon(files []File, language string) (Canon, error) {
	lang := NormalizeLanguage(language)
	out := Canon{
		Language:     lang,
		MainFileName: MainFileForLanguage(lang),
		TestFileName: TestFileForLanguage(lang),
	}

	for _, f := range files {
		base := NormalizedBaseName(f.Name)
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
		case strings.HasSuffix(base, "_test.go") && out.Test == "" && lang == "go":
			out.Test = f.Content
			out.TestFileName = base
		case base == "test_main.py":
			out.TestFileName = "test_main.py"
			out.Test = f.Content
		case strings.HasPrefix(base, "test_") && strings.HasSuffix(base, ".py") && out.Test == "" && lang == "python":
			out.TestFileName = base
			out.Test = f.Content
		case base == "main.test.ts":
			out.TestFileName = "main.test.ts"
			out.Test = f.Content
		case strings.HasSuffix(base, ".test.ts") && out.Test == "" && lang == "typescript":
			out.TestFileName = base
			out.Test = f.Content
		}
	}
	if out.Test == "" {
		return Canon{}, ErrNoTestFile
	}
	return out, nil
}

func NormalizeLanguage(raw string) string {
	switch strings.ToLower(strings.TrimSpace(raw)) {
	case "", "go":
		return "go"
	case "py", "python":
		return "python"
	case "ts", "typescript":
		return "typescript"
	default:
		return strings.ToLower(strings.TrimSpace(raw))
	}
}

func NormalizedBaseName(name string) string {
	s := strings.ReplaceAll(name, "\\", "/")
	if i := strings.LastIndex(s, "/"); i >= 0 {
		return s[i+1:]
	}
	return s
}

func MainFileForLanguage(language string) string {
	switch language {
	case "python":
		return "main.py"
	case "typescript":
		return "main.ts"
	default:
		return "main.go"
	}
}

func TestFileForLanguage(language string) string {
	switch language {
	case "python":
		return "test_main.py"
	case "typescript":
		return "main.test.ts"
	default:
		return "main_test.go"
	}
}
