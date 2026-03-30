package completed

import (
	"encoding/json"
	"errors"
	"io"
	"net/http"

	"github.com/tracelab/api/internal/auth"
)

const (
	maxSubmitBodyBytes    = 1 << 20
	maxCompletionBodyBytes = 64 << 10
)

type errorResponse struct {
	Error string `json:"error"`
}

func writeError(w http.ResponseWriter, status int, code string) {
	auth.WriteJSON(w, status, errorResponse{Error: code})
}

func decodeJSON(w http.ResponseWriter, r *http.Request, maxBytes int64, dst any) error {
	limited := http.MaxBytesReader(w, r.Body, maxBytes)
	dec := json.NewDecoder(limited)
	dec.DisallowUnknownFields()
	if err := dec.Decode(dst); err != nil {
		return err
	}
	if err := dec.Decode(&struct{}{}); err != io.EOF {
		if err == nil {
			return errors.New("trailing json")
		}
		return err
	}
	return nil
}
