// Command backfill-concept-certification-ids sets Concepts.certification_ids from legacy
// tag overlap (pre–career-track migration). Run once per database after deploying the
// certification_ids model. Use -force to replace non-empty certification_ids.
package main

import (
	"context"
	"flag"
	"log"
	"strings"
	"time"

	"github.com/tracelab/api/internal/config"
	"github.com/tracelab/api/internal/db"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo/options"
)

const connectTimeout = 30 * time.Second

// legacyCertTrackTags mirrors the old Certifications.track_tags values (tag overlap → career).
var legacyCertTrackTags = map[string][]string{
	"backend-engineer": {
		"apis", "http", "database", "sql", "distributed", "queues",
		"messaging", "reliability", "resilience", "performance",
	},
	"software-engineer": {
		"apis", "http", "database", "distributed", "performance",
		"reliability", "resilience", "patterns", "solid", "go",
	},
	"data-engineer": {
		"database", "sql", "schema", "storage", "relational",
		"numpy", "performance", "queues", "workers",
	},
	"frontend-engineer": {
		"http", "apis", "performance", "reliability", "resilience",
		"patterns", "solid", "events",
	},
	"platform-engineer": {
		"automation", "aws", "serverless", "lambda", "s3", "sqs",
		"vpc", "subnets", "compute", "storage", "reliability",
	},
	"network-engineer": {
		"networking", "load-balancing", "traffic", "latency",
		"resilience", "reliability", "http", "vpc", "subnets",
	},
}

func main() {
	force := flag.Bool("force", false, "overwrite existing non-empty certification_ids")
	dbName := flag.String("db", "", "override Mongo database name")
	collName := flag.String("coll", "", "override concepts collection name")
	dryRun := flag.Bool("dry-run", false, "print counts only, no writes")
	flag.Parse()

	cfg := config.Load()
	if cfg.MongoURI == "" {
		log.Fatal("MONGO_DB_URI is required")
	}

	targetDB := cfg.MongoDBName
	if *dbName != "" {
		targetDB = *dbName
	}
	targetColl := cfg.ConceptsColl
	if *collName != "" {
		targetColl = *collName
	}

	ctx, cancel := context.WithTimeout(context.Background(), connectTimeout)
	client, err := db.Connect(ctx, cfg.MongoURI)
	cancel()
	if err != nil {
		log.Fatalf("mongo connect: %v", err)
	}
	defer func() { _ = client.Disconnect(context.Background()) }()

	coll := client.Database(targetDB).Collection(targetColl)
	cur, err := coll.Find(context.Background(), bson.M{})
	if err != nil {
		log.Fatalf("find concepts: %v", err)
	}
	defer cur.Close(context.Background())

	var updated, skipped int
	for cur.Next(context.Background()) {
		var doc bson.M
		if err := cur.Decode(&doc); err != nil {
			log.Fatalf("decode: %v", err)
		}
		id, _ := doc["_id"].(string)
		if id == "" {
			continue
		}
		existing := nonEmptyStringSlice(doc["certification_ids"])
		if len(existing) > 0 && !*force {
			skipped++
			continue
		}
		tags := tagSliceLower(doc["tags"])
		ids := certificationIDsFromLegacyTags(tags)
		if *force {
			if *dryRun {
				log.Printf("would update %q -> %v (force)", id, ids)
				updated++
				continue
			}
			_, err := coll.UpdateByID(context.Background(), id, bson.M{
				"$set": bson.M{"certification_ids": ids},
			}, options.Update().SetUpsert(false))
			if err != nil {
				log.Fatalf("update %q: %v", id, err)
			}
			updated++
			continue
		}
		if len(ids) == 0 {
			skipped++
			continue
		}
		if *dryRun {
			log.Printf("would update %q -> %v", id, ids)
			updated++
			continue
		}
		_, err := coll.UpdateByID(context.Background(), id, bson.M{
			"$set": bson.M{"certification_ids": ids},
		}, options.Update().SetUpsert(false))
		if err != nil {
			log.Fatalf("update %q: %v", id, err)
		}
		updated++
	}
	if err := cur.Err(); err != nil {
		log.Fatalf("cursor: %v", err)
	}
	log.Printf("backfill certification_ids: updated=%d skipped=%d db=%q coll=%q dry_run=%v force=%v",
		updated, skipped, targetDB, targetColl, *dryRun, *force)
}

func certificationIDsFromLegacyTags(tags []string) []string {
	tagSet := map[string]struct{}{}
	for _, t := range tags {
		if t != "" {
			tagSet[t] = struct{}{}
		}
	}
	if _, ok := tagSet["all_tracks"]; ok {
		return []string{"*"}
	}
	out := make([]string, 0)
	seen := map[string]struct{}{}
	for certID, want := range legacyCertTrackTags {
		if tagsIntersectSet(want, tagSet) {
			if _, ok := seen[certID]; !ok {
				out = append(out, certID)
				seen[certID] = struct{}{}
			}
		}
	}
	return out
}

func tagsIntersectSet(want []string, have map[string]struct{}) bool {
	for _, t := range want {
		t = strings.ToLower(strings.TrimSpace(t))
		if t == "" {
			continue
		}
		if _, ok := have[t]; ok {
			return true
		}
	}
	return false
}

func tagSliceLower(raw any) []string {
	arr := bsonA(raw)
	out := make([]string, 0, len(arr))
	for _, v := range arr {
		if s, ok := v.(string); ok {
			t := strings.ToLower(strings.TrimSpace(s))
			if t != "" {
				out = append(out, t)
			}
		}
	}
	return out
}

func nonEmptyStringSlice(raw any) []string {
	arr := bsonA(raw)
	out := make([]string, 0, len(arr))
	for _, v := range arr {
		if s, ok := v.(string); ok {
			if strings.TrimSpace(s) != "" {
				out = append(out, s)
			}
		}
	}
	return out
}

func bsonA(raw any) []any {
	switch v := raw.(type) {
	case bson.A:
		return []any(v)
	case []any:
		return v
	default:
		return nil
	}
}
