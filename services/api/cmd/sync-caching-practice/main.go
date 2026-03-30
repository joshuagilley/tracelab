// Command sync-caching-practice reads sandbox/system-design/caching-practice and
// $set practice on Concepts _id "system-design/caching".
//
// Usage (from repo root, with .env):
//
//	make sync-caching-mongo
//
// Or:
//
//	cd services/api && go run ./cmd/sync-caching-practice -repo ../..
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

// Files are bundled into the downloadable ZIP in this order.
var practiceFiles = []string{
	"go.mod",
	"LAB.md",
	"main.go",
	"main_test.go",
	"solution.go",
}

func main() {
	repo := flag.String("repo", "", "TraceLab repo root (directory containing sandbox/)")
	flag.Parse()
	if *repo == "" {
		log.Fatal("flag -repo is required (e.g. ../.. from services/api)")
	}
	repoRoot, err := filepath.Abs(*repo)
	if err != nil {
		log.Fatal(err)
	}
	labDir := filepath.Join(repoRoot, "sandbox", "system-design", "caching-practice")
	if st, err := os.Stat(labDir); err != nil || !st.IsDir() {
		log.Fatalf("lab directory not found: %s", labDir)
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
	for _, name := range practiceFiles {
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
		"zipName": "tracelab-caching-practice.zip",
		"folder":  "caching-practice",
		"files":   files,
	}

	coll := client.Database(cfg.MongoDBName).Collection(cfg.ConceptsColl)
	res, err := coll.UpdateOne(ctx, bson.M{"_id": "system-design/caching"}, bson.M{"$set": bson.M{"practice": practice}})
	if err != nil {
		log.Fatalf("update: %v", err)
	}
	if res.MatchedCount == 0 {
		log.Fatal("no document matched _id \"system-design/caching\" — create the Concepts row first")
	}
	fmt.Printf("updated Concepts practice field (matched=%d, modified=%d)\n", res.MatchedCount, res.ModifiedCount)
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
