package auth

import "net/http"

func HintMongoDown() string { return hintMongoDown }

func MountStub(mux *http.ServeMux) {
	MountStubWithReason(mux, "auth_not_configured", hintMissingEnv)
}

func MountStubWithReason(mux *http.ServeMux, errCode, hint string) {
	stub503 := func(w http.ResponseWriter, _ *http.Request) {
		WriteJSON(w, http.StatusServiceUnavailable, map[string]string{
			"error": errCode,
			"hint":  hint,
		})
	}
	mux.HandleFunc("/api/auth/github", stub503)
	mux.HandleFunc("/api/auth/github/callback", stub503)
	mux.HandleFunc("/api/auth/me", func(w http.ResponseWriter, r *http.Request) {
		if !requireMethod(w, r, http.MethodGet) {
			return
		}
		WriteJSON(w, http.StatusOK, meResponse{User: nil})
	})
	mux.HandleFunc("/api/auth/logout", stub503)
}
