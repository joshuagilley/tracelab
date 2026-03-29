package auth

import (
	"context"
	"log"
	"net/http"
	"net/url"
	"sync"
	"time"

	"github.com/tracelab/api/internal/config"
	"go.mongodb.org/mongo-driver/mongo"
	"golang.org/x/oauth2"
)

type Handler struct {
	cfg          *config.Config
	users        *UserStore
	oauth        *oauth2.Config
	crossSiteLog sync.Once
}

func NewHandler(cfg *config.Config, users *UserStore) *Handler {
	o := &oauth2.Config{
		ClientID:     cfg.GitHubClientID,
		ClientSecret: cfg.GitHubClientSecret,
		RedirectURL:  cfg.OAuthCallbackURL,
		Endpoint: oauth2.Endpoint{
			AuthURL:  "https://github.com/login/oauth/authorize",
			TokenURL: "https://github.com/login/oauth/access_token",
		},
		Scopes: []string{"read:user", "user:email"},
	}
	return &Handler{cfg: cfg, users: users, oauth: o}
}

func (h *Handler) Register(mux *http.ServeMux) {
	mux.HandleFunc("/api/auth/github", h.githubStart)
	mux.HandleFunc("/api/auth/github/callback", h.githubCallback)
	mux.HandleFunc("/api/auth/me", h.currentUser)
	mux.HandleFunc("/api/auth/logout", h.logout)
}

func (h *Handler) githubStart(w http.ResponseWriter, r *http.Request) {
	if !requireMethod(w, r, http.MethodGet) {
		return
	}
	if !h.requireAuthStore(w) {
		return
	}
	state, err := randomState()
	if err != nil {
		http.Error(w, "state", http.StatusInternalServerError)
		return
	}
	http.SetCookie(w, h.stateCookie(r, state))
	http.Redirect(w, r, h.oauth.AuthCodeURL(state, oauth2.AccessTypeOnline), http.StatusFound)
}

func (h *Handler) githubCallback(w http.ResponseWriter, r *http.Request) {
	if !requireMethod(w, r, http.MethodGet) {
		return
	}
	if !h.requireAuthStore(w) {
		return
	}
	authCode, ok := h.validateOAuthCallback(w, r)
	if !ok {
		return
	}

	ctx, cancel := context.WithTimeout(r.Context(), 30*time.Second)
	defer cancel()

	gu, errCode := h.fetchGitHubIdentityFromCode(ctx, authCode)
	if errCode != "" {
		h.redirectAuthError(w, r, errCode)
		return
	}

	u, err := h.users.UpsertFromGitHub(ctx, gu.ID, gu.Login, gu.Name, gu.AvatarURL, gu.Email)
	if err != nil {
		h.redirectAuthError(w, r, "db")
		return
	}
	if err := h.startSession(w, r, u.ID); err != nil {
		h.redirectAuthError(w, r, "session")
		return
	}
	http.Redirect(w, r, h.cfg.FrontendOrigin+"/", http.StatusFound)
}

func (h *Handler) validateOAuthCallback(w http.ResponseWriter, r *http.Request) (string, bool) {
	q := r.URL.Query()
	if errMsg := q.Get("error"); errMsg != "" {
		h.redirectAuthError(w, r, errMsg)
		return "", false
	}
	state := q.Get("state")
	code := q.Get("code")
	if code == "" || state == "" {
		h.redirectAuthError(w, r, "missing_code")
		return "", false
	}
	sc, err := r.Cookie(oauthStateCookie)
	if err != nil || sc.Value == "" || sc.Value != state {
		h.redirectAuthError(w, r, "invalid_state")
		return "", false
	}
	http.SetCookie(w, h.clearCookie(r, oauthStateCookie))
	return code, true
}

func (h *Handler) redirectAuthError(w http.ResponseWriter, r *http.Request, code string) {
	target := h.cfg.FrontendOrigin + "/?auth_error=" + url.QueryEscape(code)
	http.Redirect(w, r, target, http.StatusFound)
}

func (h *Handler) requireAuthStore(w http.ResponseWriter) bool {
	if h.users != nil {
		return true
	}
	writeAuthNotConfigured(w)
	return false
}

func (h *Handler) currentUser(w http.ResponseWriter, r *http.Request) {
	if !requireMethod(w, r, http.MethodGet) {
		return
	}
	if !h.requireAuthStore(w) {
		return
	}
	c, err := r.Cookie(CookieName)
	if err != nil || c.Value == "" {
		WriteJSON(w, http.StatusOK, meResponse{User: nil})
		return
	}
	uid, err := parseSession(h.cfg.JWTSecret, c.Value)
	if err != nil {
		http.SetCookie(w, h.clearCookie(r, CookieName))
		WriteJSON(w, http.StatusOK, meResponse{User: nil})
		return
	}
	u, err := h.users.ByID(r.Context(), uid)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			WriteJSON(w, http.StatusOK, meResponse{User: nil})
			return
		}
		log.Printf("auth: /me load user: %v", err)
		http.Error(w, "db", http.StatusInternalServerError)
		return
	}
	WriteJSON(w, http.StatusOK, meResponse{User: userToPublicDTO(u)})
}

func (h *Handler) logout(w http.ResponseWriter, r *http.Request) {
	if !requireMethod(w, r, http.MethodPost) {
		return
	}
	if !h.requireAuthStore(w) {
		return
	}
	http.SetCookie(w, h.clearCookie(r, CookieName))
	WriteJSON(w, http.StatusOK, logoutResponse{OK: true})
}
