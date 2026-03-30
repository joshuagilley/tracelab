package completed

import (
	"context"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

// CompletionRecord is one row per completed concept: document exists ⟹ concept is done.
type CompletionRecord struct {
	ID          primitive.ObjectID `bson:"_id,omitempty"`
	UserID      primitive.ObjectID `bson:"user_id"`
	Lab         string             `bson:"lab"`
	Slug        string             `bson:"slug"`
	CompletedAt time.Time          `bson:"completed_at"`
	CreatedAt   time.Time          `bson:"created_at"`
}

type Store struct {
	coll *mongo.Collection
}

func NewStore(coll *mongo.Collection) *Store {
	return &Store{coll: coll}
}

func (s *Store) EnsureIndexes(ctx context.Context) error {
	_, err := s.coll.Indexes().CreateOne(ctx, mongo.IndexModel{
		Keys:    bson.D{{Key: "user_id", Value: 1}, {Key: "lab", Value: 1}, {Key: "slug", Value: 1}},
		Options: options.Index().SetUnique(true),
	})
	return err
}

// IsCompleted returns whether the given concept is completed and when (zero time if not).
func (s *Store) IsCompleted(ctx context.Context, userID primitive.ObjectID, lab, slug string) (bool, time.Time, error) {
	var d CompletionRecord
	err := s.coll.FindOne(ctx, bson.M{"user_id": userID, "lab": lab, "slug": slug}).Decode(&d)
	if err == mongo.ErrNoDocuments {
		return false, time.Time{}, nil
	}
	if err != nil {
		return false, time.Time{}, err
	}
	return true, d.CompletedAt, nil
}

// CompletedSlugs returns slugs the user has completed in the lab, sorted by slug.
func (s *Store) CompletedSlugs(ctx context.Context, userID primitive.ObjectID, lab string) ([]string, error) {
	opts := options.Find().
		SetProjection(bson.M{"slug": 1, "_id": 0}).
		SetSort(bson.D{{Key: "slug", Value: 1}})
	cur, err := s.coll.Find(ctx, bson.M{"user_id": userID, "lab": lab}, opts)
	if err != nil {
		return nil, err
	}
	defer cur.Close(ctx)

	var slugs []string
	for cur.Next(ctx) {
		var row struct {
			Slug string `bson:"slug"`
		}
		if err := cur.Decode(&row); err != nil {
			return nil, err
		}
		slugs = append(slugs, row.Slug)
	}
	if err := cur.Err(); err != nil {
		return nil, err
	}
	if slugs == nil {
		slugs = []string{}
	}
	return slugs, nil
}

// Complete marks a concept as done (upsert so duplicate calls are safe).
func (s *Store) Complete(ctx context.Context, userID primitive.ObjectID, lab, slug string) (time.Time, error) {
	now := time.Now().UTC()
	filter := bson.M{"user_id": userID, "lab": lab, "slug": slug}
	res := s.coll.FindOneAndUpdate(
		ctx,
		filter,
		bson.M{
			"$set":         bson.M{"completed_at": now},
			"$setOnInsert": bson.M{"user_id": userID, "lab": lab, "slug": slug, "created_at": now},
		},
		options.FindOneAndUpdate().SetUpsert(true).SetReturnDocument(options.After),
	)
	var d CompletionRecord
	if err := res.Decode(&d); err != nil {
		return time.Time{}, err
	}
	return d.CompletedAt, nil
}

// Uncomplete removes the completion record for a concept.
func (s *Store) Uncomplete(ctx context.Context, userID primitive.ObjectID, lab, slug string) error {
	_, err := s.coll.DeleteOne(ctx, bson.M{"user_id": userID, "lab": lab, "slug": slug})
	return err
}
