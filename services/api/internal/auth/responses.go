package auth

import (
	"encoding/json"
	"net/http"
	"strings"
)

func requireMethod(w http.ResponseWriter, r *http.Request, method string) bool {
	if r.Method == method {
		return true
	}
	w.Header().Set("Allow", method)
	http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
	return false
}

func requireMethods(w http.ResponseWriter, r *http.Request, methods ...string) bool {
	for _, m := range methods {
		if r.Method == m {
			return true
		}
	}
	w.Header().Set("Allow", strings.Join(methods, ", "))
	http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
	return false
}

// RequireMethod is the exported variant for handlers outside this package.
func RequireMethod(w http.ResponseWriter, r *http.Request, method string) bool {
	return requireMethod(w, r, method)
}

// RequireMethods is the exported variant for handlers outside this package.
func RequireMethods(w http.ResponseWriter, r *http.Request, methods ...string) bool {
	return requireMethods(w, r, methods...)
}

func WriteJSON(w http.ResponseWriter, status int, v any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(v)
}

func writeAuthNotConfigured(w http.ResponseWriter) {
	WriteJSON(w, http.StatusServiceUnavailable, map[string]string{
		"error": "auth_not_configured",
		"hint":  hintMissingEnv,
	})
}
