package catalog

import (
	"context"
	"errors"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type Store struct {
	labs     *mongo.Collection
	concepts *mongo.Collection
}

func NewStore(labs, concepts *mongo.Collection) *Store {
	return &Store{labs: labs, concepts: concepts}
}

// ListLabs returns all lab documents sorted by title.
func (s *Store) ListLabs(ctx context.Context) ([]bson.M, error) {
	opts := options.Find().SetSort(bson.D{{Key: "title", Value: 1}})
	cur, err := s.labs.Find(ctx, bson.M{}, opts)
	if err != nil {
		return nil, err
	}
	defer cur.Close(ctx)

	var labs []bson.M
	for cur.Next(ctx) {
		var doc bson.M
		if err := cur.Decode(&doc); err != nil {
			return nil, err
		}
		labs = append(labs, doc)
	}
	if err := cur.Err(); err != nil {
		return nil, err
	}
	if labs == nil {
		labs = []bson.M{}
	}
	return labs, nil
}

// LoadLesson loads the merged lesson payload for a lab id and concept slug.
func (s *Store) LoadLesson(ctx context.Context, labID, slug string) (bson.M, error) {
	var labDoc bson.M
	if err := s.labs.FindOne(ctx, bson.M{"_id": labID}).Decode(&labDoc); err != nil {
		if errors.Is(err, mongo.ErrNoDocuments) {
			return nil, ErrLabNotFound
		}
		return nil, err
	}

	row, err := findConceptRow(labDoc, slug)
	if err != nil {
		return nil, err
	}

	conceptID := labID + "/" + slug
	var detail bson.M
	derr := s.concepts.FindOne(ctx, bson.M{"_id": conceptID}).Decode(&detail)
	if derr != nil && !errors.Is(derr, mongo.ErrNoDocuments) {
		return nil, derr
	}
	if errors.Is(derr, mongo.ErrNoDocuments) {
		detail = nil
	}

	return mergeLesson(row, detail), nil
}
