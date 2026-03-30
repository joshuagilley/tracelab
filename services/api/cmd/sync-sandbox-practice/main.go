// Command sync-sandbox-practice reads files from sandbox/<path> and $set practice on a Concepts document.
// This is the only practice-sync binary. From repo root, prefer:
//
//	make sync-sandbox-mongo SANDBOX=... CONCEPT=... ZIP=... FOLDER=... FILES=...
//
// Or manually (load-balancer-shaped bundle):
//
//	cd services/api && go run ./cmd/sync-sandbox-practice -repo ../.. -sandbox system-design/load-balancer -concept system-design/load-balancing -zip tracelab-load-balancer-practice.zip -folder load-balancer -files go.mod,LAB.md,main.go,main_test.go,solution.go,present.go,bad.go
package main

import (
	"context"
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
)

func main() {
	repo := flag.String("repo", "", "TraceLab repo root (directory containing sandbox/)")
	sandboxRel := flag.String("sandbox", "", "Path under sandbox/, e.g. system-design/load-balancer")
	conceptID := flag.String("concept", "", "Concepts _id, e.g. system-design/load-balancing")
	zipName := flag.String("zip", "", "practice.zipName in Mongo")
	folder := flag.String("folder", "", "practice.folder (directory name inside the ZIP)")
	filesCSV := flag.String("files", "", "Comma-separated filenames relative to sandbox dir, e.g. go.mod,LAB.md,main.go")
	flag.Parse()

	if *repo == "" || *sandboxRel == "" || *conceptID == "" || *zipName == "" || *folder == "" || *filesCSV == "" {
		log.Fatal("all flags required: -repo -sandbox -concept -zip -folder -files")
	}

	repoRoot, err := filepath.Abs(*repo)
	if err != nil {
		log.Fatal(err)
	}
	labDir := filepath.Join(repoRoot, "sandbox", filepath.FromSlash(*sandboxRel))
	if st, err := os.Stat(labDir); err != nil || !st.IsDir() {
		log.Fatalf("sandbox directory not found: %s", labDir)
	}

	names := strings.Split(*filesCSV, ",")
	var fileNames []string
	for _, n := range names {
		n = strings.TrimSpace(n)
		if n != "" {
			fileNames = append(fileNames, n)
		}
	}
	if len(fileNames) == 0 {
		log.Fatal("no files after parsing -files")
	}

	_ = loadEnvFile(filepath.Join(repoRoot, ".env"))
	cfg := config.Load()
	if strings.TrimSpace(cfg.MongoURI) == "" {
		log.Fatal("MONGO_DB_URI is not set (source .env or export it)")
	}

	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	client, err := db.Connect(ctx, cfg.MongoURI)
	if err != nil {
		log.Fatalf("mongo: %v", err)
	}
	defer func() { _ = client.Disconnect(context.Background()) }()

	files := bson.A{}
	for _, name := range fileNames {
		p := filepath.Join(labDir, filepath.FromSlash(name))
		b, err := os.ReadFile(p)
		if err != nil {
			log.Fatalf("read %s: %v", p, err)
		}
		files = append(files, bson.M{
			"name":    strings.ReplaceAll(name, `\`, `/`),
			"content": string(b),
		})
	}

	practice := bson.M{
		"zipName": *zipName,
		"folder":  *folder,
		"files":   files,
	}

	coll := client.Database(cfg.MongoDBName).Collection(cfg.ConceptsColl)
	res, err := coll.UpdateOne(ctx, bson.M{"_id": *conceptID}, bson.M{"$set": bson.M{"practice": practice}})
	if err != nil {
		log.Fatalf("update: %v", err)
	}
	if res.MatchedCount == 0 {
		log.Fatalf("no document matched _id %q — create the Concepts row first", *conceptID)
	}
	fmt.Printf("updated Concepts practice for %q (matched=%d, modified=%d)\n", *conceptID, res.MatchedCount, res.ModifiedCount)
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
		if len(val) >= 2 && ((val[0] == '"' && val[len(val)-1] == '"') || (val[0] == '\'' && val[len(val)-1] == '\'')) {
			val = val[1 : len(val)-1]
		}
		_ = os.Setenv(key, val)
	}
	return nil
}
