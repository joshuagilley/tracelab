package labstorage

import (
	"context"
	"fmt"
	"io"
	"strings"

	"cloud.google.com/go/storage"
	"github.com/tracelab/api/internal/practicefiles"
	"google.golang.org/api/iterator"
)

// GCSReader lists and reads object bodies under a prefix in one bucket.
type GCSReader struct {
	client *storage.Client
}

func NewGCSReader(c *storage.Client) *GCSReader {
	return &GCSReader{client: c}
}

// ReadAllFiles returns objects under prefix/ (relative names without the prefix).
// When allowed is non-nil, only objects whose basename appears in allowed are read
// (skips stray files in the prefix for cleanliness).
func (g *GCSReader) ReadAllFiles(ctx context.Context, bucket, prefix string, allowed map[string]struct{}) ([]practicefiles.File, error) {
	prefix = strings.Trim(prefix, "/")
	if prefix == "" {
		return nil, fmt.Errorf("empty object prefix")
	}
	listPrefix := prefix + "/"
	b := g.client.Bucket(bucket)
	it := b.Objects(ctx, &storage.Query{Prefix: listPrefix})
	var out []practicefiles.File
	for {
		attrs, err := it.Next()
		if err == iterator.Done {
			break
		}
		if err != nil {
			return nil, err
		}
		if strings.HasSuffix(attrs.Name, "/") {
			continue
		}
		rel := strings.TrimPrefix(attrs.Name, listPrefix)
		if rel == "" {
			continue
		}
		base := practicefiles.NormalizedBaseName(rel)
		if len(allowed) > 0 {
			if _, ok := allowed[base]; !ok {
				continue
			}
		}
		rc, err := b.Object(attrs.Name).NewReader(ctx)
		if err != nil {
			return nil, fmt.Errorf("open %s: %w", attrs.Name, err)
		}
		body, err := io.ReadAll(rc)
		_ = rc.Close()
		if err != nil {
			return nil, fmt.Errorf("read %s: %w", attrs.Name, err)
		}
		out = append(out, practicefiles.File{Name: rel, Content: string(body)})
	}
	if len(out) == 0 {
		return nil, fmt.Errorf("no objects under gs://%s/%s", bucket, listPrefix)
	}
	return out, nil
}
