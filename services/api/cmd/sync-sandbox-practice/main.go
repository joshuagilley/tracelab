// Command sync-sandbox-practice reads files from sandbox/<path> and $set practice on a Concepts document.
// This is the only practice-sync binary. From repo root, prefer:
//
//	make sync-sandbox-mongo SANDBOX=... CONCEPT=... ZIP=... FOLDER=... FILES=...
//
// Or manually (load-balancer-shaped bundle):
//
//	cd services/api && go run ./cmd/sync-sandbox-practice -repo ../.. -sandbox system-design/load-balancer -concept system-design/load-balancing -zip tracelab-load-balancer-practice.zip -folder load-balancer -files go.mod,LAB.md,main.go,main_test.go,solution.go,present.go,bad.go
//
// Use -dry-run to print payload summary (file list + byte sizes) without Mongo.
package main

import (
	"context"
	"errors"
	"flag"
	"fmt"
	"log"
	"os"
	"path/filepath"
	"strings"
	"time"

	"github.com/tracelab/api/internal/config"
	"github.com/tracelab/api/internal/db"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
)

type options struct {
	repoRoot   string
	sandboxRel string
	conceptID  string
	zipName    string
	folder     string
	fileNames  []string
	dryRun     bool
}

type practiceFile struct {
	Name    string `bson:"name"`
	Content string `bson:"content"`
}

type practicePayload struct {
	ZipName string         `bson:"zipName"`
	Folder  string         `bson:"folder"`
	Files   []practiceFile `bson:"files"`
}

func main() {
	if err := run(); err != nil {
		log.Fatal(err)
	}
}

func run() error {
	opts, err := parseOptions()
	if err != nil {
		return err
	}

	if err := loadEnvFile(filepath.Join(opts.repoRoot, ".env")); err != nil {
		return fmt.Errorf("load .env: %w", err)
	}

	cfg := config.Load()
	if !opts.dryRun && strings.TrimSpace(cfg.MongoURI) == "" {
		return errors.New("MONGO_DB_URI is not set (source .env or export it)")
	}

	practice, err := buildPracticePayload(opts)
	if err != nil {
		return err
	}

	if opts.dryRun {
		printDryRunSummary(opts, practice)
		return nil
	}

	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	client, err := db.Connect(ctx, cfg.MongoURI)
	if err != nil {
		return fmt.Errorf("mongo connect: %w", err)
	}
	defer func() { _ = client.Disconnect(context.Background()) }()

	return updateConceptPractice(ctx, client, cfg, opts.conceptID, practice)
}

func parseOptions() (options, error) {
	repo := flag.String("repo", "", "TraceLab repo root (directory containing sandbox/)")
	sandboxRel := flag.String("sandbox", "", "Path under sandbox/, e.g. system-design/load-balancer")
	conceptID := flag.String("concept", "", "Concepts _id, e.g. system-design/load-balancing")
	zipName := flag.String("zip", "", "practice.zipName in Mongo")
	folder := flag.String("folder", "", "practice.folder (directory name inside the ZIP)")
	filesCSV := flag.String("files", "", "Comma-separated filenames relative to sandbox dir, e.g. go.mod,LAB.md,main.go")
	dryRun := flag.Bool("dry-run", false, "print payload summary and exit without connecting to Mongo")
	flag.Parse()

	if *dryRun {
		if *repo == "" || *sandboxRel == "" || *zipName == "" || *folder == "" || *filesCSV == "" {
			return options{}, errors.New("dry-run requires: -repo -sandbox -zip -folder -files (-concept optional for display)")
		}
	} else {
		if *repo == "" || *sandboxRel == "" || *conceptID == "" || *zipName == "" || *folder == "" || *filesCSV == "" {
			return options{}, errors.New("all flags required: -repo -sandbox -concept -zip -folder -files")
		}
	}

	repoRoot, err := filepath.Abs(*repo)
	if err != nil {
		return options{}, fmt.Errorf("resolve repo root: %w", err)
	}

	fileNames, err := parseFileList(*filesCSV)
	if err != nil {
		return options{}, err
	}
	if len(fileNames) == 0 {
		return options{}, errors.New("no files after parsing -files")
	}

	sandboxDir := filepath.Join(repoRoot, "sandbox", filepath.FromSlash(*sandboxRel))
	if err := requireDir(sandboxDir); err != nil {
		return options{}, fmt.Errorf("invalid sandbox directory: %w", err)
	}

	return options{
		repoRoot:   repoRoot,
		sandboxRel: *sandboxRel,
		conceptID:  *conceptID,
		zipName:    *zipName,
		folder:     *folder,
		fileNames:  fileNames,
		dryRun:     *dryRun,
	}, nil
}

func parseFileList(csv string) ([]string, error) {
	parts := strings.Split(csv, ",")
	out := make([]string, 0, len(parts))

	for _, part := range parts {
		name := strings.TrimSpace(part)
		if name == "" {
			continue
		}
		slash := filepath.ToSlash(name)
		if err := validateSandboxRelativeFile(slash); err != nil {
			return nil, fmt.Errorf("-files entry %q: %w", name, err)
		}
		out = append(out, slash)
	}

	return out, nil
}

// validateSandboxRelativeFile rejects absolute paths and ".." traversal in -files entries.
func validateSandboxRelativeFile(name string) error {
	if name == "" || name == "." {
		return errors.New("empty file name")
	}
	if filepath.IsAbs(name) {
		return fmt.Errorf("absolute path not allowed")
	}
	for _, seg := range strings.Split(name, "/") {
		if seg == "" {
			continue
		}
		if seg == ".." || seg == "." {
			return fmt.Errorf("invalid path segment %q", seg)
		}
	}
	return nil
}

func requireDir(path string) error {
	info, err := os.Stat(path)
	if err != nil {
		if os.IsNotExist(err) {
			return fmt.Errorf("%s does not exist", path)
		}
		return err
	}
	if !info.IsDir() {
		return fmt.Errorf("%s is not a directory", path)
	}
	return nil
}

func buildPracticePayload(opts options) (practicePayload, error) {
	sandboxDir := filepath.Join(opts.repoRoot, "sandbox", filepath.FromSlash(opts.sandboxRel))

	files := make([]practiceFile, 0, len(opts.fileNames))
	for _, name := range opts.fileNames {
		fullPath := filepath.Join(sandboxDir, filepath.FromSlash(name))
		fullClean := filepath.Clean(fullPath)
		sandboxClean := filepath.Clean(sandboxDir)
		rel, err := filepath.Rel(sandboxClean, fullClean)
		if err != nil || strings.HasPrefix(rel, "..") {
			return practicePayload{}, fmt.Errorf("resolved path escapes sandbox: %s", name)
		}

		content, err := os.ReadFile(fullClean)
		if err != nil {
			return practicePayload{}, fmt.Errorf("read %s: %w", fullClean, err)
		}

		files = append(files, practiceFile{
			Name:    name,
			Content: string(content),
		})
	}

	return practicePayload{
		ZipName: opts.zipName,
		Folder:  opts.folder,
		Files:   files,
	}, nil
}

func printDryRunSummary(opts options, p practicePayload) {
	fmt.Println("dry-run: would $set Concepts.practice with:")
	if opts.conceptID != "" {
		fmt.Printf("  concept _id: %q\n", opts.conceptID)
	}
	fmt.Printf("  zipName: %q\n", p.ZipName)
	fmt.Printf("  folder:  %q\n", p.Folder)
	fmt.Printf("  files:   %d entries\n", len(p.Files))
	for _, f := range p.Files {
		fmt.Printf("    - %s (%d bytes)\n", f.Name, len(f.Content))
	}
}

func updateConceptPractice(
	ctx context.Context,
	client *mongo.Client,
	cfg *config.Config,
	conceptID string,
	practice practicePayload,
) error {
	coll := client.Database(cfg.MongoDBName).Collection(cfg.ConceptsColl)

	res, err := coll.UpdateOne(
		ctx,
		bson.M{"_id": conceptID},
		bson.M{"$set": bson.M{"practice": practice}},
	)
	if err != nil {
		return fmt.Errorf("update concept %q: %w", conceptID, err)
	}
	if res.MatchedCount == 0 {
		return fmt.Errorf("no document matched _id %q; create the Concepts row first", conceptID)
	}

	fmt.Printf("updated Concepts practice for %q (matched=%d, modified=%d)\n", conceptID, res.MatchedCount, res.ModifiedCount)
	return nil
}

func loadEnvFile(path string) error {
	b, err := os.ReadFile(path)
	if err != nil {
		if os.IsNotExist(err) {
			return nil
		}
		return err
	}

	for _, line := range strings.Split(string(b), "\n") {
		line = strings.TrimSpace(line)
		if line == "" || strings.HasPrefix(line, "#") {
			continue
		}

		i := strings.IndexByte(line, '=')
		if i <= 0 {
			continue
		}

		key := strings.TrimSpace(line[:i])
		val := strings.TrimSpace(line[i+1:])

		if len(val) >= 2 {
			if (val[0] == '"' && val[len(val)-1] == '"') || (val[0] == '\'' && val[len(val)-1] == '\'') {
				val = val[1 : len(val)-1]
			}
		}

		_ = os.Setenv(key, val)
	}

	return nil
}
