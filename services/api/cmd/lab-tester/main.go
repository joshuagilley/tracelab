// Lab-tester verifies reference practice implementations against canonical tests.
// It reads labs/concepts.json (manifest of every concept bundle), applies each
// bundle’s reference file over its starter, runs testCommand, then restores the starter.
package main

import (
	"bytes"
	"encoding/json"
	"errors"
	"flag"
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
	"strings"
)

func main() {
	repo := flag.String("repo", "", "repository root (must contain labs/concepts.json and sandbox/)")
	manifestRel := flag.String("manifest", "labs/concepts.json", "path under repo to the concepts manifest")
	flag.Parse()

	root := strings.TrimSpace(*repo)
	if root == "" {
		fmt.Fprintln(os.Stderr, "lab-tester: -repo is required")
		os.Exit(2)
	}
	repoRoot, err := filepath.Abs(root)
	if err != nil {
		fmt.Fprintf(os.Stderr, "lab-tester: %v\n", err)
		os.Exit(2)
	}

	manifestPath := filepath.Join(repoRoot, filepath.FromSlash(strings.TrimSpace(*manifestRel)))
	data, err := os.ReadFile(manifestPath)
	if err != nil {
		fmt.Fprintf(os.Stderr, "lab-tester: read manifest %s: %v\n", manifestPath, err)
		os.Exit(2)
	}

	var m manifest
	if err := json.Unmarshal(data, &m); err != nil {
		fmt.Fprintf(os.Stderr, "lab-tester: parse manifest: %v\n", err)
		os.Exit(2)
	}
	if len(m.Concepts) == 0 {
		fmt.Fprintln(os.Stderr, "lab-tester: manifest has no concepts")
		os.Exit(2)
	}

	sandboxRoot := filepath.Join(repoRoot, "sandbox")
	if st, err := os.Stat(sandboxRoot); err != nil || !st.IsDir() {
		fmt.Fprintf(os.Stderr, "lab-tester: missing sandbox/: %s\n", sandboxRoot)
		os.Exit(2)
	}

	var failures []string
	for _, c := range m.Concepts {
		if len(c.Bundles) == 0 {
			fmt.Fprintf(os.Stderr, "lab-tester: warning: concept %q has no bundles, skipping\n", c.ID)
			continue
		}
		for i, b := range c.Bundles {
			ctx := fmt.Sprintf("concept %q bundle[%d] (%s)", c.ID, i, b.Type)
			if err := runBundle(sandboxRoot, ctx, b); err != nil {
				failures = append(failures, fmt.Sprintf("%s: %v", ctx, err))
			}
		}
	}

	if len(failures) > 0 {
		fmt.Fprintln(os.Stderr, "lab-tester: failures:")
		for _, f := range failures {
			fmt.Fprintln(os.Stderr, "  -", f)
		}
		os.Exit(1)
	}
	nBundles := 0
	for _, c := range m.Concepts {
		nBundles += len(c.Bundles)
	}
	fmt.Printf("lab-tester: ok (%d bundle(s) across %d concept(s))\n", nBundles, len(m.Concepts))
}

type manifest struct {
	Concepts []conceptEntry `json:"concepts"`
}

type conceptEntry struct {
	ID      string        `json:"id"`
	Bundles []bundleEntry `json:"bundles"`
}

type bundleEntry struct {
	Type string `json:"type"`

	SandboxPath   string   `json:"sandboxPath"`
	ReferenceFile string   `json:"referenceFile"`
	StarterFile   string   `json:"starterFile"`
	TestCommand   []string `json:"testCommand"`
	Workdir       string   `json:"workdir,omitempty"`
}

func runBundle(sandboxRoot, ctx string, b bundleEntry) error {
	if strings.TrimSpace(b.Type) == "" {
		return errors.New("missing type")
	}
	if strings.TrimSpace(b.SandboxPath) == "" {
		return errors.New("missing sandboxPath")
	}
	if strings.TrimSpace(b.ReferenceFile) == "" || strings.TrimSpace(b.StarterFile) == "" {
		return errors.New("missing referenceFile or starterFile")
	}
	if len(b.TestCommand) == 0 {
		return errors.New("missing testCommand")
	}

	bundleRoot := filepath.Join(sandboxRoot, filepath.FromSlash(b.SandboxPath))
	if st, err := os.Stat(bundleRoot); err != nil || !st.IsDir() {
		return fmt.Errorf("sandboxPath not a directory: %s", bundleRoot)
	}

	workdir := bundleRoot
	if wd := strings.TrimSpace(b.Workdir); wd != "" {
		workdir = filepath.Join(bundleRoot, filepath.FromSlash(wd))
		if st, err := os.Stat(workdir); err != nil || !st.IsDir() {
			return fmt.Errorf("workdir not a directory: %s", workdir)
		}
	}

	refAbs := filepath.Join(bundleRoot, filepath.FromSlash(b.ReferenceFile))
	startAbs := filepath.Join(bundleRoot, filepath.FromSlash(b.StarterFile))
	if _, err := os.Stat(refAbs); err != nil {
		return fmt.Errorf("referenceFile: %w", err)
	}
	if _, err := os.Stat(startAbs); err != nil {
		return fmt.Errorf("starterFile: %w", err)
	}

	refBytes, err := os.ReadFile(refAbs)
	if err != nil {
		return err
	}
	startOrig, err := os.ReadFile(startAbs)
	if err != nil {
		return err
	}

	body := refBytes
	switch strings.ToLower(strings.TrimSpace(b.Type)) {
	case "go":
		body = stripLeadingGoBuildLines(refBytes)
	case "python":
		// raw copy
	default:
		return fmt.Errorf("unsupported type %q", b.Type)
	}

	if err := os.WriteFile(startAbs, body, 0o644); err != nil {
		return err
	}
	defer func() { _ = os.WriteFile(startAbs, startOrig, 0o644) }()

	cmd := exec.Command(b.TestCommand[0], b.TestCommand[1:]...)
	cmd.Dir = workdir
	cmd.Env = os.Environ()
	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr
	if err := cmd.Run(); err != nil {
		return fmt.Errorf("%s: %w", strings.Join(b.TestCommand, " "), err)
	}

	return nil
}

// stripLeadingGoBuildLines removes leading //go:build / // +build constraint lines
// so a reference file can use //go:build ignore while tests compile starter+tests.
func stripLeadingGoBuildLines(src []byte) []byte {
	lines := bytes.Split(src, []byte{'\n'})
	i := 0
	for i < len(lines) {
		line := lines[i]
		trim := bytes.TrimSpace(line)
		if len(trim) == 0 {
			i++
			continue
		}
		s := string(trim)
		if strings.HasPrefix(s, "//go:build") || strings.HasPrefix(s, "// +build") {
			i++
			continue
		}
		break
	}
	out := bytes.Join(lines[i:], []byte{'\n'})
	return bytes.TrimPrefix(out, []byte{'\n'})
}
