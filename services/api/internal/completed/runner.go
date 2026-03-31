package completed

import (
	"context"
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
	"time"
)

const (
	defaultPracticeRunTimeout = 10 * time.Second
	maxRunnerOutputBytes      = 64 << 10
)

// RunResult is the outcome of executing go test in an isolated temp module.
type RunResult struct {
	Output string
	Passed bool
}

// Runner executes canonical tests against submitted main source.
type Runner interface {
	Run(ctx context.Context, language, mainCode string, canon CanonicalPracticeFiles) (RunResult, error)
}

// GoRunner runs `go test ./...` in a temporary module directory.
// User-submitted code is executed on the host; for production hardening prefer containers,
// resource limits, and no network (see architecture docs).
type GoRunner struct {
	Timeout time.Duration
}

func NewGoRunner(timeout time.Duration) *GoRunner {
	if timeout <= 0 {
		timeout = defaultPracticeRunTimeout
	}
	return &GoRunner{Timeout: timeout}
}

func (g *GoRunner) Run(ctx context.Context, language, mainCode string, canon CanonicalPracticeFiles) (RunResult, error) {
	switch normalizedLanguage(language) {
	case "go":
		return g.runGo(ctx, mainCode, canon)
	case "python":
		return g.runPython(ctx, mainCode, canon)
	case "typescript":
		return g.runTypescript(ctx, mainCode, canon)
	default:
		return RunResult{Output: fmt.Sprintf("unsupported language: %s", language), Passed: false}, nil
	}
}

func (g *GoRunner) runGo(ctx context.Context, mainCode string, canon CanonicalPracticeFiles) (RunResult, error) {
	ctx, cancel := context.WithTimeout(ctx, g.Timeout)
	defer cancel()

	dir, err := os.MkdirTemp("", "tracelab-submit-*")
	if err != nil {
		return RunResult{}, err
	}
	defer func() { _ = os.RemoveAll(dir) }()

	goMod := canon.Module
	if goMod == "" {
		goMod = "module submitted\n\ngo 1.25.0\n"
	}
	if err := os.WriteFile(filepath.Join(dir, "go.mod"), []byte(goMod), 0o644); err != nil {
		return RunResult{}, err
	}
	if err := os.WriteFile(filepath.Join(dir, "main.go"), []byte(mainCode), 0o644); err != nil {
		return RunResult{}, err
	}
	testName := canon.TestFileName
	if testName == "" {
		testName = "main_test.go"
	}
	if err := os.WriteFile(filepath.Join(dir, testName), []byte(canon.Test), 0o644); err != nil {
		return RunResult{}, err
	}

	cmd := exec.CommandContext(ctx, "go", "test", "./...")
	cmd.Dir = dir
	cmd.Env = append(os.Environ(), "GOSUMDB=off")
	out, err := cmd.CombinedOutput()
	output := truncateRunnerOutput(string(out))

	if ctx.Err() == context.DeadlineExceeded {
		return RunResult{Output: "test run timed out", Passed: false}, nil
	}
	if err != nil {
		return RunResult{Output: output, Passed: false}, nil
	}
	return RunResult{Output: output, Passed: true}, nil
}

func (g *GoRunner) runPython(ctx context.Context, mainCode string, canon CanonicalPracticeFiles) (RunResult, error) {
	ctx, cancel := context.WithTimeout(ctx, g.Timeout)
	defer cancel()

	dir, err := os.MkdirTemp("", "tracelab-submit-*")
	if err != nil {
		return RunResult{}, err
	}
	defer func() { _ = os.RemoveAll(dir) }()

	if err := os.WriteFile(filepath.Join(dir, "main.py"), []byte(mainCode), 0o644); err != nil {
		return RunResult{}, err
	}
	testName := canon.TestFileName
	if testName == "" {
		testName = "test_main.py"
	}
	if err := os.WriteFile(filepath.Join(dir, testName), []byte(canon.Test), 0o644); err != nil {
		return RunResult{}, err
	}

	pythonBin := "python3"
	if _, lookErr := exec.LookPath(pythonBin); lookErr != nil {
		pythonBin = "python"
	}
	cmd := exec.CommandContext(ctx, pythonBin, "-m", "unittest", "discover", "-s", ".", "-p", testName)
	cmd.Dir = dir
	out, err := cmd.CombinedOutput()
	output := truncateRunnerOutput(string(out))

	if ctx.Err() == context.DeadlineExceeded {
		return RunResult{Output: "test run timed out", Passed: false}, nil
	}
	if err != nil {
		return RunResult{Output: output, Passed: false}, nil
	}
	return RunResult{Output: output, Passed: true}, nil
}

func (g *GoRunner) runTypescript(ctx context.Context, mainCode string, canon CanonicalPracticeFiles) (RunResult, error) {
	ctx, cancel := context.WithTimeout(ctx, g.Timeout)
	defer cancel()

	dir, err := os.MkdirTemp("", "tracelab-submit-*")
	if err != nil {
		return RunResult{}, err
	}
	defer func() { _ = os.RemoveAll(dir) }()

	if err := os.WriteFile(filepath.Join(dir, "main.ts"), []byte(mainCode), 0o644); err != nil {
		return RunResult{}, err
	}
	testName := canon.TestFileName
	if testName == "" {
		testName = "main.test.ts"
	}
	if err := os.WriteFile(filepath.Join(dir, testName), []byte(canon.Test), 0o644); err != nil {
		return RunResult{}, err
	}
	// Optional module metadata from practice bundle.
	if canon.ModuleFileName != "" && canon.Module != "" {
		if err := os.WriteFile(filepath.Join(dir, canon.ModuleFileName), []byte(canon.Module), 0o644); err != nil {
			return RunResult{}, err
		}
	}

	// Lightweight approach for now: execute tests through tsx.
	cmd := exec.CommandContext(ctx, "npx", "--yes", "tsx", "--test", testName)
	cmd.Dir = dir
	out, err := cmd.CombinedOutput()
	output := truncateRunnerOutput(string(out))

	if ctx.Err() == context.DeadlineExceeded {
		return RunResult{Output: "test run timed out", Passed: false}, nil
	}
	if err != nil {
		return RunResult{Output: output, Passed: false}, nil
	}
	return RunResult{Output: output, Passed: true}, nil
}

func truncateRunnerOutput(s string) string {
	if len(s) <= maxRunnerOutputBytes {
		return s
	}
	return s[:maxRunnerOutputBytes] + "\n… (output truncated)\n"
}
