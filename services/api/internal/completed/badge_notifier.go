package completed

import (
	"context"
	"fmt"
	"log"
	"net/smtp"
	"strings"

	"github.com/tracelab/api/internal/auth"
	"github.com/tracelab/api/internal/certifications"
	"github.com/tracelab/api/internal/config"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

type BadgeNotifier struct {
	enabled      bool
	cfg          *config.Config
	users        *auth.UserStore
	completions  *Store
	certs        *certifications.Store
	receipts     *BadgeEmailStore
	labsColl     *mongo.Collection
	conceptsColl *mongo.Collection
}

func NewBadgeNotifier(
	cfg *config.Config,
	users *auth.UserStore,
	completions *Store,
	certs *certifications.Store,
	receipts *BadgeEmailStore,
	labsColl, conceptsColl *mongo.Collection,
) *BadgeNotifier {
	enabled := cfg.SMTPHost != "" && cfg.SMTPUser != "" && cfg.SMTPPass != "" && cfg.SMTPFrom != ""
	return &BadgeNotifier{
		enabled:      enabled,
		cfg:          cfg,
		users:        users,
		completions:  completions,
		certs:        certs,
		receipts:     receipts,
		labsColl:     labsColl,
		conceptsColl: conceptsColl,
	}
}

func (n *BadgeNotifier) NotifyNewlyEarnedBadges(ctx context.Context, userID primitive.ObjectID) {
	if n == nil || !n.enabled {
		return
	}
	user, err := n.users.ByID(ctx, userID)
	if err != nil || strings.TrimSpace(user.Email) == "" {
		return
	}
	certs, err := n.certs.ListActive(ctx)
	if err != nil || len(certs) == 0 {
		return
	}
	published, err := n.loadPublishedConcepts(ctx)
	if err != nil || len(published) == 0 {
		return
	}

	completedByLab := map[string]map[string]struct{}{}
	for _, row := range published {
		if _, ok := completedByLab[row.Lab]; ok {
			continue
		}
		slugs, err := n.completions.CompletedSlugs(ctx, userID, row.Lab)
		if err != nil {
			return
		}
		set := make(map[string]struct{}, len(slugs))
		for _, s := range slugs {
			set[s] = struct{}{}
		}
		completedByLab[row.Lab] = set
	}

	for _, cert := range certs {
		total := 0
		done := 0
		for _, concept := range published {
			if !conceptMatchesCert(concept.Tags, cert) {
				continue
			}
			total++
			if _, ok := completedByLab[concept.Lab][concept.Slug]; ok {
				done++
			}
		}
		if total == 0 || done < total {
			continue
		}
		inserted, err := n.receipts.TryMarkSent(ctx, userID, cert.ID)
		if err != nil || !inserted {
			continue
		}
		if err := n.sendBadgeEmail(user.Email, user.Login, cert); err != nil {
			log.Printf("completed.badge-email send failed user=%s cert=%s: %v", userID.Hex(), cert.ID, err)
		}
	}
}

type publishedConcept struct {
	Lab  string
	Slug string
	Tags []string
}

func (n *BadgeNotifier) loadPublishedConcepts(ctx context.Context) ([]publishedConcept, error) {
	cur, err := n.labsColl.Find(ctx, bson.M{})
	if err != nil {
		return nil, err
	}
	defer cur.Close(ctx)

	var out []publishedConcept
	for cur.Next(ctx) {
		var labDoc bson.M
		if err := cur.Decode(&labDoc); err != nil {
			return nil, err
		}
		labID, _ := labDoc["_id"].(string)
		if labID == "" {
			continue
		}
		if concepts, ok := conceptsFromLabDoc(labDoc, labID); ok {
			out = append(out, concepts...)
			continue
		}
		fromConcepts, err := n.loadPublishedFromConcepts(ctx, labID)
		if err != nil {
			return nil, err
		}
		out = append(out, fromConcepts...)
	}
	if err := cur.Err(); err != nil {
		return nil, err
	}
	return out, nil
}

func (n *BadgeNotifier) loadPublishedFromConcepts(ctx context.Context, labID string) ([]publishedConcept, error) {
	filter := bson.M{
		"$or": []bson.M{
			{"labId": labID},
			{"lab": labID},
		},
	}
	cur, err := n.conceptsColl.Find(ctx, filter)
	if err != nil {
		return nil, err
	}
	defer cur.Close(ctx)
	out := make([]publishedConcept, 0)
	for cur.Next(ctx) {
		var doc bson.M
		if err := cur.Decode(&doc); err != nil {
			return nil, err
		}
		status, _ := doc["status"].(string)
		if status != "available" {
			continue
		}
		slug, _ := doc["slug"].(string)
		if slug == "" {
			continue
		}
		out = append(out, publishedConcept{
			Lab:  labID,
			Slug: slug,
			Tags: stringSlice(doc["tags"]),
		})
	}
	return out, cur.Err()
}

func conceptsFromLabDoc(labDoc bson.M, labID string) ([]publishedConcept, bool) {
	raw, ok := labDoc["concepts"]
	if !ok {
		return nil, false
	}
	arr, ok := asAnySliceAny(raw)
	if !ok {
		return nil, false
	}
	out := make([]publishedConcept, 0, len(arr))
	for _, it := range arr {
		cm, ok := it.(bson.M)
		if !ok {
			continue
		}
		status, _ := cm["status"].(string)
		if status != "available" {
			continue
		}
		slug, _ := cm["slug"].(string)
		if slug == "" {
			continue
		}
		out = append(out, publishedConcept{
			Lab:  labID,
			Slug: slug,
			Tags: stringSlice(cm["tags"]),
		})
	}
	return out, true
}

func stringSlice(raw any) []string {
	arr, ok := asAnySliceAny(raw)
	if !ok {
		return nil
	}
	out := make([]string, 0, len(arr))
	for _, v := range arr {
		if s, ok := v.(string); ok {
			out = append(out, strings.ToLower(strings.TrimSpace(s)))
		}
	}
	return out
}

func asAnySliceAny(raw any) ([]any, bool) {
	switch v := raw.(type) {
	case []any:
		return v, true
	case bson.A:
		return []any(v), true
	default:
		return nil, false
	}
}

func conceptMatchesCert(tags []string, cert certifications.Certification) bool {
	if cert.ID == "generalist" || cert.ID == "expert" || len(cert.TrackTags) == 0 {
		return true
	}
	wanted := map[string]struct{}{}
	for _, t := range cert.TrackTags {
		t = strings.ToLower(strings.TrimSpace(t))
		if t != "" {
			wanted[t] = struct{}{}
		}
	}
	if len(wanted) == 0 {
		return true
	}
	for _, t := range tags {
		if _, ok := wanted[strings.ToLower(strings.TrimSpace(t))]; ok {
			return true
		}
	}
	return false
}

func (n *BadgeNotifier) sendBadgeEmail(to, login string, cert certifications.Certification) error {
	addr := fmt.Sprintf("%s:%s", n.cfg.SMTPHost, n.cfg.SMTPPort)
	auth := smtp.PlainAuth("", n.cfg.SMTPUser, n.cfg.SMTPPass, n.cfg.SMTPHost)
	badgeURL := strings.TrimSuffix(n.cfg.FrontendOrigin, "/") + cert.ImagePath
	subject := fmt.Sprintf("Your TraceLab badge is ready: %s", cert.Title)
	if login == "" {
		login = "there"
	}
	body := fmt.Sprintf(
		"<p>Hi %s,</p><p>Congrats! You completed the requirements for <strong>%s</strong>.</p><p>You can use this badge on your portfolio:</p><p><a href=\"%s\">%s</a></p><p><img src=\"%s\" alt=\"%s badge\" style=\"max-width:340px;height:auto;\" /></p><p>- TraceLab</p>",
		login, cert.Title, badgeURL, badgeURL, badgeURL, cert.Title,
	)
	msg := "From: " + n.cfg.SMTPFrom + "\r\n" +
		"To: " + to + "\r\n" +
		"Subject: " + subject + "\r\n" +
		"MIME-Version: 1.0\r\n" +
		"Content-Type: text/html; charset=UTF-8\r\n\r\n" +
		body
	return smtp.SendMail(addr, auth, n.cfg.SMTPFrom, []string{to}, []byte(msg))
}
