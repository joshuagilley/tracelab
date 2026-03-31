package certifications

import (
	"context"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type Certification struct {
	ID          string    `json:"id" bson:"_id"`
	Title       string    `json:"title" bson:"title"`
	RoleKey     string    `json:"roleKey" bson:"role_key"`
	Description string    `json:"description" bson:"description"`
	ImagePath   string    `json:"imagePath" bson:"image_path"`
	TrackTags   []string  `json:"trackTags,omitempty" bson:"track_tags,omitempty"`
	SortOrder   int       `json:"sortOrder" bson:"sort_order"`
	Active      bool      `json:"active" bson:"active"`
	CreatedAt   time.Time `json:"createdAt,omitempty" bson:"created_at,omitempty"`
	UpdatedAt   time.Time `json:"updatedAt,omitempty" bson:"updated_at,omitempty"`
}

type Store struct {
	coll *mongo.Collection
}

func NewStore(coll *mongo.Collection) *Store {
	return &Store{coll: coll}
}

func (s *Store) EnsureIndexes(ctx context.Context) error {
	_, err := s.coll.Indexes().CreateOne(ctx, mongo.IndexModel{
		Keys:    bson.D{{Key: "sort_order", Value: 1}, {Key: "title", Value: 1}},
		Options: options.Index().SetUnique(true),
	})
	return err
}

func (s *Store) ListActive(ctx context.Context) ([]Certification, error) {
	cur, err := s.coll.Find(ctx, bson.M{"active": true}, options.Find().SetSort(
		bson.D{{Key: "sort_order", Value: 1}, {Key: "title", Value: 1}},
	))
	if err != nil {
		return nil, err
	}
	defer cur.Close(ctx)

	out := make([]Certification, 0)
	for cur.Next(ctx) {
		var c Certification
		if err := cur.Decode(&c); err != nil {
			return nil, err
		}
		out = append(out, c)
	}
	if err := cur.Err(); err != nil {
		return nil, err
	}
	return out, nil
}
