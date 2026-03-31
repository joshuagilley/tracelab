package main

import (
	"context"
	"flag"
	"log"
	"time"

	"github.com/tracelab/api/internal/certifications"
	"github.com/tracelab/api/internal/config"
	"github.com/tracelab/api/internal/db"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo/options"
)

const connectTimeout = 30 * time.Second

func main() {
	dbName := flag.String("db", "", "override Mongo database name")
	collName := flag.String("coll", "", "override certifications collection name")
	flag.Parse()

	cfg := config.Load()
	if cfg.MongoURI == "" {
		log.Fatal("MONGO_DB_URI is required")
	}

	targetDB := cfg.MongoDBName
	if *dbName != "" {
		targetDB = *dbName
	}
	targetColl := cfg.CertificationsColl
	if *collName != "" {
		targetColl = *collName
	}

	ctx, cancel := context.WithTimeout(context.Background(), connectTimeout)
	client, err := db.Connect(ctx, cfg.MongoURI)
	cancel()
	if err != nil {
		log.Fatalf("mongo connect: %v", err)
	}
	defer func() {
		_ = client.Disconnect(context.Background())
	}()

	coll := client.Database(targetDB).Collection(targetColl)
	now := time.Now().UTC()

	for _, doc := range certifications.DefaultCertifications {
		update := bson.M{
			"$set": bson.M{
				"title":       doc.Title,
				"role_key":    doc.RoleKey,
				"description": doc.Description,
				"image_path":  doc.ImagePath,
				"track_tags":  doc.TrackTags,
				"sort_order":  doc.SortOrder,
				"active":      doc.Active,
				"updated_at":  now,
			},
			"$setOnInsert": bson.M{
				"created_at": now,
			},
		}
		_, err := coll.UpdateByID(context.Background(), doc.ID, update, options.Update().SetUpsert(true))
		if err != nil {
			log.Fatalf("upsert %q failed: %v", doc.ID, err)
		}
	}

	log.Printf("seeded certifications: count=%d db=%q coll=%q", len(certifications.DefaultCertifications), targetDB, targetColl)
}
