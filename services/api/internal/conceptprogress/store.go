package conceptprogress

import (
	"context"
	"errors"
	"fmt"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

// WholeConceptSectionID is the only progress key: one completion toggle per concept lesson.
const WholeConceptSectionID = "concept"

// ErrInvalidSectionID is returned when section_id is not WholeConceptSectionID.
var ErrInvalidSectionID = errors.New("conceptprogress: invalid section_id")

// Doc is one row per user + lab + concept slug; completed_sections holds ["concept"] when done.
type Doc struct {
	ID                 primitive.ObjectID `bson:"_id,omitempty"`
	UserID             primitive.ObjectID `bson:"user_id"`
	Lab                string             `bson:"lab"`
	Slug               string             `bson:"slug"`
	CompletedSections  []string           `bson:"completed_sections"`
	CreatedAt          time.Time          `bson:"created_at"`
	UpdatedAt          time.Time          `bson:"updated_at"`
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

func (s *Store) CompletedSections(ctx context.Context, userID primitive.ObjectID, lab, slug string) ([]string, error) {
	var d Doc
	err := s.coll.FindOne(ctx, bson.M{"user_id": userID, "lab": lab, "slug": slug}).Decode(&d)
	if err == mongo.ErrNoDocuments {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	return d.CompletedSections, nil
}

// AllByUserAndLab returns completed_sections keyed by concept slug for this user in the lab.
func (s *Store) AllByUserAndLab(ctx context.Context, userID primitive.ObjectID, lab string) (map[string][]string, error) {
	cur, err := s.coll.Find(ctx, bson.M{"user_id": userID, "lab": lab})
	if err != nil {
		return nil, err
	}
	defer cur.Close(ctx)
	out := make(map[string][]string)
	for cur.Next(ctx) {
		var d Doc
		if err := cur.Decode(&d); err != nil {
			return nil, err
		}
		out[d.Slug] = d.CompletedSections
	}
	if err := cur.Err(); err != nil {
		return nil, err
	}
	return out, nil
}

func (s *Store) SetSection(ctx context.Context, userID primitive.ObjectID, lab, slug, sectionID string, completed bool) error {
	if sectionID != WholeConceptSectionID {
		return fmt.Errorf("%w: got %q want %q", ErrInvalidSectionID, sectionID, WholeConceptSectionID)
	}
	now := time.Now().UTC()
	filter := bson.M{"user_id": userID, "lab": lab, "slug": slug}
	var sections []string
	if completed {
		sections = []string{WholeConceptSectionID}
	}
	_, err := s.coll.UpdateOne(ctx, filter, bson.M{
		"$set": bson.M{
			"completed_sections": sections,
			"updated_at":         now,
		},
		"$setOnInsert": bson.M{
			"user_id":    userID,
			"lab":        lab,
			"slug":       slug,
			"created_at": now,
		},
	}, options.Update().SetUpsert(true))
	return err
}
