package db

import (
	"context"
	"time"

	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
	"go.mongodb.org/mongo-driver/mongo/readpref"
)

const (
	serverSelectionTimeout = 25 * time.Second
	disconnectTimeout      = 5 * time.Second
)

// Connect creates a Mongo client from the given URI, verifies connectivity with
// a ping to the primary, and returns the connected client.
func Connect(ctx context.Context, uri string) (*mongo.Client, error) {
	opts := options.Client().
		ApplyURI(uri).
		SetServerSelectionTimeout(serverSelectionTimeout)

	client, err := mongo.Connect(ctx, opts)
	if err != nil {
		return nil, err
	}

	if err := client.Ping(ctx, readpref.Primary()); err != nil {
		disconnectCtx, cancel := context.WithTimeout(context.Background(), disconnectTimeout)
		defer cancel()
		_ = client.Disconnect(disconnectCtx)
		return nil, err
	}

	return client, nil
}
