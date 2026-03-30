package completed

import (
	"context"
	"encoding/json"
	"errors"
	"log"
	"net/http"
	"os"
	"os/exec"
	"path"
	"path/filepath"
	"strings"
	"time"

	"github.com/tracelab/api/internal/auth"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
)

type submitFile struct {
	Name    string `json:"name"`
	Content string `json:"content"`
}

type submitBody struct {
	Lab   string       `json:"lab"`
	Slug  string       `json:"slug"`
	Files []submitFile `json:"files"`
}

type submitResponse struct {
	Passed      bool    `json:"passed"`
	Completed   bool    `json:"completed"`
	CompletedAt *string `json:"completedAt"`
	Output      string  `json:"output"`
}

type practiceDoc struct {
	Practice struct {
		Files []submitFile `bson:"files"`
	} `bson:"practice"`
}

func (h *Handler) submitLab(w http.ResponseWriter, r *http.Request) {
	if !auth.RequireMethod(w, r, http.MethodPost) {
		return
	}
	uid, err := auth.SessionUserID(h.cfg.JWTSecret, r)
	if err != nil {
		auth.WriteJSON(w, http.StatusUnauthorized, map[string]string{"error": "unauthorized"})
		return
	}

	r.Body = http.MaxBytesReader(w, r.Body, 1<<20)
	var body submitBody
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		auth.WriteJSON(w, http.StatusBadRequest, map[string]string{"error": "invalid_json"})
		return
	}
	if body.Lab == "" || body.Slug == "" {
		auth.WriteJSON(w, http.StatusBadRequest, map[string]string{"error": "lab_and_slug_required"})
		return
	}

	mainCode, ok := pickSubmittedFile(body.Files, "main.go")
	if !ok {
		auth.WriteJSON(w, http.StatusBadRequest, map[string]string{"error": "main_go_required"})
		return
	}

	testCode, goModCode, err := h.fetchCanonicalPracticeFiles(r.Context(), body.Lab, body.Slug)
	if err != nil {
		if errors.Is(err, mongo.ErrNoDocuments) {
			auth.WriteJSON(w, http.StatusNotFound, map[string]string{"error": "practice_not_found"})
			return
		}
		log.Printf("completed: load practice lab=%q slug=%q: %v", body.Lab, body.Slug, err)
		http.Error(w, "db", http.StatusInternalServerError)
		return
	}

	mainCode = stripGoBuildIgnoreFromMain(mainCode)
	out, passed := runPracticeCheck(mainCode, testCode, goModCode)
	if !passed {
		auth.WriteJSON(w, http.StatusOK, submitResponse{
			Passed:    false,
			Completed: false,
			Output:    out,
		})
		return
	}

	completedAt, err := h.store.Complete(r.Context(), uid, body.Lab, body.Slug)
	if err != nil {
		log.Printf("completed: mark done after submit lab=%q slug=%q: %v", body.Lab, body.Slug, err)
		http.Error(w, "db", http.StatusInternalServerError)
		return
	}
	ts := completedAt.Format(time.RFC3339)
	auth.WriteJSON(w, http.StatusOK, submitResponse{
		Passed:      true,
		Completed:   true,
		CompletedAt: &ts,
		Output:      out,
	})
}

func (h *Handler) fetchCanonicalPracticeFiles(ctx context.Context, lab, slug string) (testCode, goModCode string, err error) {
	conceptID := lab + "/" + slug
	var doc practiceDoc
	if err := h.conceptsColl.FindOne(ctx, bson.M{"_id": conceptID}).Decode(&doc); err != nil {
		return "", "", err
	}
	for _, f := range doc.Practice.Files {
		base := cleanBaseName(f.Name)
		switch {
		case base == "go.mod":
			goModCode = f.Content
		case base == "main_test.go":
			testCode = f.Content
		case strings.HasSuffix(base, "_test.go") && testCode == "":
			testCode = f.Content
		}
	}
	if testCode == "" {
		return "", "", errors.New("no test file in practice config")
	}
	return testCode, goModCode, nil
}

func pickSubmittedFile(files []submitFile, target string) (string, bool) {
	for _, f := range files {
		if cleanBaseName(f.Name) == target {
			return f.Content, true
		}
	}
	return "", false
}

func cleanBaseName(name string) string {
	return path.Base(strings.ReplaceAll(name, "\\", "/"))
}

// stripGoBuildIgnoreFromMain removes leading build-constraint lines so a pasted
// solution.go (//go:build ignore) is still compiled during go test.
func stripGoBuildIgnoreFromMain(src string) string {
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

func runPracticeCheck(mainCode, testCode, goModCode string) (string, bool) {
	dir, err := os.MkdirTemp("", "tracelab-submit-*")
	if err != nil {
		return "failed to create temp dir", false
	}
	defer os.RemoveAll(dir)

	if goModCode == "" {
		goModCode = "module submitted\n\ngo 1.25.0\n"
	}
	if err := os.WriteFile(filepath.Join(dir, "go.mod"), []byte(goModCode), 0o644); err != nil {
		return "failed to write go.mod", false
	}
	if err := os.WriteFile(filepath.Join(dir, "main.go"), []byte(mainCode), 0o644); err != nil {
		return "failed to write main.go", false
	}
	if err := os.WriteFile(filepath.Join(dir, "main_test.go"), []byte(testCode), 0o644); err != nil {
		return "failed to write main_test.go", false
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	cmd := exec.CommandContext(ctx, "go", "test", "./...")
	cmd.Dir = dir
	cmd.Env = append(os.Environ(), "GOSUMDB=off")
	out, err := cmd.CombinedOutput()
	if ctx.Err() == context.DeadlineExceeded {
		return "test run timed out", false
	}
	if err != nil {
		return string(out), false
	}
	return string(out), true
}
