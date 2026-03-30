package db

import (
	"context"
	"time"

	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
	"go.mongodb.org/mongo-driver/mongo/readpref"
)

// Connect applies the URI, uses a 25s server selection timeout, and Ping(primary).
func Connect(ctx context.Context, uri string) (*mongo.Client, error) {
	opts := options.Client().
		ApplyURI(uri).
		SetServerSelectionTimeout(25 * time.Second)

	client, err := mongo.Connect(ctx, opts)
	if err != nil {
		return nil, err
	}
	if err := client.Ping(ctx, readpref.Primary()); err != nil {
		_ = client.Disconnect(context.Background())
		return nil, err
	}
	return client, nil
}
