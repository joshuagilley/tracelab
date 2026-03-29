package auth

import (
	"context"
	"log"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

// User is stored in MongoDB (collection name from config, default "Users").
type User struct {
	ID          primitive.ObjectID `json:"id" bson:"_id,omitempty"`
	GitHubID    int64              `json:"githubId" bson:"github_id"`
	Login       string             `json:"login" bson:"login"`
	Name        string             `json:"name,omitempty" bson:"name,omitempty"`
	AvatarURL   string             `json:"avatarUrl,omitempty" bson:"avatar_url,omitempty"`
	Email       string             `json:"email,omitempty" bson:"email,omitempty"`
	CreatedAt   time.Time          `json:"createdAt" bson:"created_at"`
	UpdatedAt   time.Time          `json:"updatedAt" bson:"updated_at"`
}

type UserStore struct {
	coll *mongo.Collection
}

func NewUserStore(coll *mongo.Collection) *UserStore {
	return &UserStore{coll: coll}
}

func (s *UserStore) EnsureIndexes(ctx context.Context) error {
	_, err := s.coll.Indexes().CreateOne(ctx, mongo.IndexModel{
		Keys:    bson.D{{Key: "github_id", Value: 1}},
		Options: options.Index().SetUnique(true),
	})
	return err
}

// UpsertFromGitHub creates or updates a user row for this GitHub account.
func (s *UserStore) UpsertFromGitHub(ctx context.Context, ghID int64, login, name, avatarURL, email string) (*User, error) {
	now := time.Now().UTC()
	filter := bson.M{"github_id": ghID}
	update := bson.M{
		"$set": bson.M{
			"login":      login,
			"name":       name,
			"avatar_url": avatarURL,
			"email":      email,
			"updated_at": now,
		},
		"$setOnInsert": bson.M{
			"created_at": now,
		},
	}
	opts := options.FindOneAndUpdate().SetUpsert(true).SetReturnDocument(options.After)
	var out User
	err := s.coll.FindOneAndUpdate(ctx, filter, update, opts).Decode(&out)
	if err != nil {
		log.Printf("auth/store: UpsertFromGitHub failed github_id=%d login=%q: %v", ghID, login, err)
		return nil, err
	}
	log.Printf("auth/store: UpsertFromGitHub ok github_id=%d mongo_id=%s login=%q coll=%s", ghID, out.ID.Hex(), login, s.coll.Name())
	return &out, nil
}

func (s *UserStore) ByID(ctx context.Context, id primitive.ObjectID) (*User, error) {
	var u User
	err := s.coll.FindOne(ctx, bson.M{"_id": id}).Decode(&u)
	if err != nil {
		if err != mongo.ErrNoDocuments {
			log.Printf("auth/store: ByID failed mongo_id=%s: %v", id.Hex(), err)
		}
		return nil, err
	}
	return &u, nil
}
