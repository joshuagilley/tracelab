package catalog

import (
	"net/http"

	"github.com/tracelab/api/internal/auth"
)

type errorResponse struct {
	Error string `json:"error"`
}

func writeError(w http.ResponseWriter, status int, code string) {
	auth.WriteJSON(w, status, errorResponse{Error: code})
}
