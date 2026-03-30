package db

import (
	"context"
	"time"

	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
	"go.mongodb.org/mongo-driver/mongo/readpref"
)

// Connect builds a client from URI, then Ping against the primary.
// Uses only ApplyURI-derived options plus a generous server selection timeout
// (Cloud Run → NAT → Atlas often needs >10s on first connection).
func Connect(ctx context.Context, uri string) (*mongo.Client, error) {
	opts := options.Client().
		ApplyURI(uri).
		SetServerSelectionTimeout(25 * time.Second)

	client, err := mongo.Connect(ctx, opts)
	if err != nil {
		return nil, err
	}
	// Same ctx as startup: do not nest a shorter timeout here or Ping may fail
	// while TCP probes still succeed (driver needs time for TLS + replica discovery).
	if err := client.Ping(ctx, readpref.Primary()); err != nil {
		_ = client.Disconnect(context.Background())
		return nil, err
	}
	return client, nil
}
