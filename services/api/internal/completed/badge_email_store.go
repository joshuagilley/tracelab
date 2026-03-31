package completed

import (
	"context"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type BadgeEmailReceipt struct {
	ID              primitive.ObjectID `bson:"_id,omitempty"`
	UserID          primitive.ObjectID `bson:"user_id"`
	CertificationID string             `bson:"certification_id"`
	SentAt          time.Time          `bson:"sent_at"`
}

type BadgeEmailStore struct {
	coll *mongo.Collection
}

func NewBadgeEmailStore(coll *mongo.Collection) *BadgeEmailStore {
	return &BadgeEmailStore{coll: coll}
}

func (s *BadgeEmailStore) EnsureIndexes(ctx context.Context) error {
	_, err := s.coll.Indexes().CreateOne(ctx, mongo.IndexModel{
		Keys:    bson.D{{Key: "user_id", Value: 1}, {Key: "certification_id", Value: 1}},
		Options: options.Index().SetUnique(true),
	})
	return err
}

// TryMarkSent inserts an idempotency receipt; false means it was already sent before.
func (s *BadgeEmailStore) TryMarkSent(ctx context.Context, userID primitive.ObjectID, certID string) (bool, error) {
	_, err := s.coll.InsertOne(ctx, BadgeEmailReceipt{
		UserID:          userID,
		CertificationID: certID,
		SentAt:          time.Now().UTC(),
	})
	if err == nil {
		return true, nil
	}
	if mongo.IsDuplicateKeyError(err) {
		return false, nil
	}
	return false, err
}
