package catalog

import (
	"fmt"
	"log"
	"net/http"
	"strings"

	"github.com/tracelab/api/internal/auth"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
)

type Handler struct {
	labsColl     *mongo.Collection
	conceptsColl *mongo.Collection
}

func NewHandler(labsColl, conceptsColl *mongo.Collection) *Handler {
	return &Handler{labsColl: labsColl, conceptsColl: conceptsColl}
}

func (h *Handler) Register(mux *http.ServeMux) {
	mux.HandleFunc("/api/catalog/labs", h.handleLabs)
	mux.HandleFunc("/api/catalog/lesson", h.handleLesson)
}

// GET /api/catalog/labs → { "labs": [ { ...lab doc... }, ... ] }
func (h *Handler) handleLabs(w http.ResponseWriter, r *http.Request) {
	if !auth.RequireMethod(w, r, http.MethodGet) {
		return
	}
	ctx := r.Context()
	cur, err := h.labsColl.Find(ctx, bson.M{})
	if err != nil {
		log.Printf("catalog: list labs: %v", err)
		http.Error(w, "db", http.StatusInternalServerError)
		return
	}
	defer cur.Close(ctx)

	var labs []bson.M
	for cur.Next(ctx) {
		var doc bson.M
		if err := cur.Decode(&doc); err != nil {
			log.Printf("catalog: decode lab: %v", err)
			http.Error(w, "db", http.StatusInternalServerError)
			return
		}
		labs = append(labs, doc)
	}
	if err := cur.Err(); err != nil {
		log.Printf("catalog: labs cursor: %v", err)
		http.Error(w, "db", http.StatusInternalServerError)
		return
	}
	if labs == nil {
		labs = []bson.M{}
	}
	auth.WriteJSON(w, http.StatusOK, map[string]any{"labs": labs})
}

// GET /api/catalog/lesson?lab=&slug= → merged LabConceptDetail-shaped JSON
func (h *Handler) handleLesson(w http.ResponseWriter, r *http.Request) {
	if !auth.RequireMethod(w, r, http.MethodGet) {
		return
	}
	labID := r.URL.Query().Get("lab")
	slug := r.URL.Query().Get("slug")
	if labID == "" || slug == "" {
		auth.WriteJSON(w, http.StatusBadRequest, map[string]string{"error": "lab_and_slug_required"})
		return
	}

	ctx := r.Context()
	var labDoc bson.M
	if err := h.labsColl.FindOne(ctx, bson.M{"_id": labID}).Decode(&labDoc); err != nil {
		if err == mongo.ErrNoDocuments {
			auth.WriteJSON(w, http.StatusNotFound, map[string]string{"error": "lab_not_found"})
			return
		}
		log.Printf("catalog: find lab %q: %v", labID, err)
		http.Error(w, "db", http.StatusInternalServerError)
		return
	}

	row, err := findConceptRow(labDoc, slug)
	if err != nil {
		auth.WriteJSON(w, http.StatusNotFound, map[string]string{"error": "concept_not_in_catalog"})
		return
	}

	conceptID := labID + "/" + slug
	var detail bson.M
	derr := h.conceptsColl.FindOne(ctx, bson.M{"_id": conceptID}).Decode(&detail)
	if derr != nil && derr != mongo.ErrNoDocuments {
		log.Printf("catalog: find concept %q: %v", conceptID, derr)
		http.Error(w, "db", http.StatusInternalServerError)
		return
	}
	if derr == mongo.ErrNoDocuments {
		detail = nil
	}

	out := mergeLesson(row, detail)
	auth.WriteJSON(w, http.StatusOK, out)
}

func findConceptRow(labDoc bson.M, slug string) (bson.M, error) {
	raw, ok := labDoc["concepts"]
	if !ok || raw == nil {
		return nil, fmt.Errorf("no concepts")
	}
	arr, ok := raw.(bson.A)
	if !ok {
		return nil, fmt.Errorf("concepts not array")
	}
	for _, item := range arr {
		cm, ok := item.(bson.M)
		if !ok {
			continue
		}
		s, ok := cm["slug"].(string)
		if ok && s == slug {
			return cm, nil
		}
	}
	return nil, fmt.Errorf("slug not found")
}

func mergeLesson(row, detail bson.M) bson.M {
	out := bson.M{}
	for k, v := range row {
		out[k] = v
	}
	if detail != nil {
		for k, v := range detail {
			if k == "_id" || k == "lab" || k == "slug" {
				continue
			}
			out[k] = v
		}
	}

	detailCF := codeFilesFromDoc(detail)
	rowCF := codeFilesFromDoc(row)
	var merged []any
	if len(detailCF) > 0 {
		merged = detailCF
	} else {
		merged = emptyCodeFiles(rowCF)
	}
	out["codeFiles"] = normalizeCodeFilesForLesson(merged)
	return out
}

// normalizeCodeFilesForLesson maps Mongo shapes to the SPA contract: body in "code",
// optional "lang" (inferred from filename when missing). Some docs use "content" like practice.files.
func normalizeCodeFilesForLesson(files []any) []any {
	if len(files) == 0 {
		return []any{}
	}
	out := make([]any, 0, len(files))
	for _, item := range files {
		cm, ok := item.(bson.M)
		if !ok {
			continue
		}
		m := bson.M{}
		for k, v := range cm {
			m[k] = v
		}
		code, _ := m["code"].(string)
		if strings.TrimSpace(code) == "" {
			if c, ok := m["content"].(string); ok {
				m["code"] = c
			}
		}
		lang, _ := m["lang"].(string)
		if strings.TrimSpace(lang) == "" {
			name, _ := m["name"].(string)
			m["lang"] = inferCodeLangFromName(name)
		}
		out = append(out, m)
	}
	return out
}

func inferCodeLangFromName(name string) string {
	switch {
	case strings.HasSuffix(name, ".go"):
		return "go"
	case strings.HasSuffix(name, ".md"):
		return "markdown"
	case strings.HasSuffix(name, ".mod"):
		return "go"
	default:
		return "text"
	}
}

func codeFilesFromDoc(doc bson.M) []any {
	if doc == nil {
		return nil
	}
	raw, ok := doc["codeFiles"]
	if !ok || raw == nil {
		return nil
	}
	arr, ok := raw.(bson.A)
	if !ok {
		return nil
	}
	return []any(arr)
}

func emptyCodeFiles(rowFiles []any) []any {
	if len(rowFiles) == 0 {
		return []any{}
	}
	out := make([]any, 0, len(rowFiles))
	for _, item := range rowFiles {
		cm, ok := item.(bson.M)
		if !ok {
			continue
		}
		name, _ := cm["name"].(string)
		lang, _ := cm["lang"].(string)
		role := cm["role"]
		m := bson.M{"name": name, "lang": lang, "code": ""}
		if role != nil {
			m["role"] = role
		}
		out = append(out, m)
	}
	return out
}
