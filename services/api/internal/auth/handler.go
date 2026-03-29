package auth

import (
	"context"
	"crypto/rand"
	"encoding/hex"
	"encoding/json"
	"io"
	"net/http"
	"net/url"
	"strings"
	"time"

	"github.com/tracelab/api/internal/config"
	"go.mongodb.org/mongo-driver/mongo"
	"golang.org/x/oauth2"
)

const (
	oauthStateCookie = "oauth_state"
	stateCookieTTL   = 10 * time.Minute
	sessionTTL       = 30 * 24 * time.Hour
)

type Handler struct {
	cfg   *config.Config
	users *UserStore
	oauth *oauth2.Config
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

func (h *Handler) authDisabled(w http.ResponseWriter) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusServiceUnavailable)
	_ = json.NewEncoder(w).Encode(map[string]string{
		"error": "auth_not_configured",
		"hint":  hintMissingEnv,
	})
}

func (h *Handler) Register(mux *http.ServeMux) {
	mux.HandleFunc("/api/auth/github", h.githubStart)
	mux.HandleFunc("/api/auth/github/callback", h.githubCallback)
	mux.HandleFunc("/api/auth/me", h.me)
	mux.HandleFunc("/api/auth/logout", h.logout)
}

func (h *Handler) githubStart(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		return
	}
	if h.users == nil {
		h.authDisabled(w)
		return
	}
	state, err := randomState()
	if err != nil {
		http.Error(w, "state", http.StatusInternalServerError)
		return
	}
	http.SetCookie(w, h.stateCookie(state))
	authURL := h.oauth.AuthCodeURL(state, oauth2.AccessTypeOnline)
	http.Redirect(w, r, authURL, http.StatusFound)
}

type githubUser struct {
	ID        int64  `json:"id"`
	Login     string `json:"login"`
	Name      string `json:"name"`
	AvatarURL string `json:"avatar_url"`
	Email     string `json:"email"`
}

func (h *Handler) githubCallback(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		return
	}
	if h.users == nil {
		h.authDisabled(w)
		return
	}
	q := r.URL.Query()
	if errMsg := q.Get("error"); errMsg != "" {
		http.Redirect(w, r, h.cfg.FrontendOrigin+"/?auth_error="+url.QueryEscape(errMsg), http.StatusFound)
		return
	}
	state := q.Get("state")
	code := q.Get("code")
	if code == "" || state == "" {
		http.Redirect(w, r, h.cfg.FrontendOrigin+"/?auth_error=missing_code", http.StatusFound)
		return
	}
	sc, err := r.Cookie(oauthStateCookie)
	if err != nil || sc.Value == "" || sc.Value != state {
		http.Redirect(w, r, h.cfg.FrontendOrigin+"/?auth_error=invalid_state", http.StatusFound)
		return
	}
	http.SetCookie(w, h.clearCookie(oauthStateCookie))

	ctx, cancel := context.WithTimeout(r.Context(), 30*time.Second)
	defer cancel()

	tok, err := h.oauth.Exchange(ctx, code)
	if err != nil {
		http.Redirect(w, r, h.cfg.FrontendOrigin+"/?auth_error=token_exchange", http.StatusFound)
		return
	}
	client := h.oauth.Client(ctx, tok)
	req, _ := http.NewRequestWithContext(ctx, http.MethodGet, "https://api.github.com/user", nil)
	resp, err := client.Do(req)
	if err != nil {
		http.Redirect(w, r, h.cfg.FrontendOrigin+"/?auth_error=github_user", http.StatusFound)
		return
	}
	defer resp.Body.Close()
	body, _ := io.ReadAll(io.LimitReader(resp.Body, 1<<20))
	if resp.StatusCode != http.StatusOK {
		http.Redirect(w, r, h.cfg.FrontendOrigin+"/?auth_error=github_api", http.StatusFound)
		return
	}
	var gu githubUser
	if err := json.Unmarshal(body, &gu); err != nil || gu.ID == 0 {
		http.Redirect(w, r, h.cfg.FrontendOrigin+"/?auth_error=parse_user", http.StatusFound)
		return
	}
	if gu.Email == "" {
		gu.Email = h.fetchPrimaryGitHubEmail(ctx, client)
	}

	u, err := h.users.UpsertFromGitHub(ctx, gu.ID, gu.Login, gu.Name, gu.AvatarURL, gu.Email)
	if err != nil {
		http.Redirect(w, r, h.cfg.FrontendOrigin+"/?auth_error=db", http.StatusFound)
		return
	}
	jwtStr, err := signSession(h.cfg.JWTSecret, u.ID, sessionTTL)
	if err != nil {
		http.Redirect(w, r, h.cfg.FrontendOrigin+"/?auth_error=session", http.StatusFound)
		return
	}
	http.SetCookie(w, h.sessionCookie(jwtStr))
	http.Redirect(w, r, h.cfg.FrontendOrigin+"/", http.StatusFound)
}

func (h *Handler) fetchPrimaryGitHubEmail(ctx context.Context, client *http.Client) string {
	req, _ := http.NewRequestWithContext(ctx, http.MethodGet, "https://api.github.com/user/emails", nil)
	resp, err := client.Do(req)
	if err != nil {
		return ""
	}
	defer resp.Body.Close()
	body, _ := io.ReadAll(io.LimitReader(resp.Body, 1<<20))
	var emails []struct {
		Email    string `json:"email"`
		Primary  bool   `json:"primary"`
		Verified bool   `json:"verified"`
	}
	if json.Unmarshal(body, &emails) != nil {
		return ""
	}
	for _, e := range emails {
		if e.Primary && e.Verified {
			return e.Email
		}
	}
	for _, e := range emails {
		if e.Verified {
			return e.Email
		}
	}
	return ""
}

func (h *Handler) me(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		return
	}
	if h.users == nil {
		h.authDisabled(w)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	c, err := r.Cookie(CookieName)
	if err != nil || c.Value == "" {
		_ = json.NewEncoder(w).Encode(map[string]any{"user": nil})
		return
	}
	uid, err := parseSession(h.cfg.JWTSecret, c.Value)
	if err != nil {
		_ = json.NewEncoder(w).Encode(map[string]any{"user": nil})
		return
	}
	u, err := h.users.ByID(r.Context(), uid)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			_ = json.NewEncoder(w).Encode(map[string]any{"user": nil})
			return
		}
		http.Error(w, "db", http.StatusInternalServerError)
		return
	}
	_ = json.NewEncoder(w).Encode(map[string]any{"user": publicUser(u)})
}

func publicUser(u *User) map[string]any {
	return map[string]any{
		"id":        u.ID.Hex(),
		"githubId":  u.GitHubID,
		"login":     u.Login,
		"name":      u.Name,
		"avatarUrl": u.AvatarURL,
	}
}

func (h *Handler) logout(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost && r.Method != http.MethodGet {
		w.Header().Set("Allow", "GET, POST")
		http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		return
	}
	http.SetCookie(w, h.clearCookie(CookieName))
	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(map[string]bool{"ok": true})
}

func (h *Handler) sessionCookie(value string) *http.Cookie {
	same, secure := h.cookieAttrs()
	return &http.Cookie{
		Name:     CookieName,
		Value:    value,
		Path:     "/",
		MaxAge:   int(sessionTTL.Seconds()),
		HttpOnly: true,
		SameSite: same,
		Secure:   secure,
	}
}

func (h *Handler) stateCookie(value string) *http.Cookie {
	same, secure := h.cookieAttrs()
	return &http.Cookie{
		Name:     oauthStateCookie,
		Value:    value,
		Path:     "/",
		MaxAge:   int(stateCookieTTL.Seconds()),
		HttpOnly: true,
		SameSite: same,
		Secure:   secure,
	}
}

func (h *Handler) clearCookie(name string) *http.Cookie {
	same, secure := h.cookieAttrs()
	return &http.Cookie{
		Name:     name,
		Value:    "",
		Path:     "/",
		MaxAge:   -1,
		HttpOnly: true,
		SameSite: same,
		Secure:   secure,
	}
}

// cookieAttrs: Lax + Secure for https same-site-ish setups; None + Secure when SPA and API are on different hosts.
func (h *Handler) cookieAttrs() (http.SameSite, bool) {
	if h.cfg.AuthCookieCrossSite {
		return http.SameSiteNoneMode, true
	}
	secure := strings.HasPrefix(h.cfg.FrontendOrigin, "https://")
	return http.SameSiteLaxMode, secure
}

func randomState() (string, error) {
	b := make([]byte, 16)
	if _, err := rand.Read(b); err != nil {
		return "", err
	}
	return hex.EncodeToString(b), nil
}

const (
	hintMissingEnv = "Set MONGO_DB_URI, GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET, OAUTH_CALLBACK_URL, AUTH_JWT_SECRET on the API service (Cloud Run → tracelab-api → Variables & secrets)."
	hintMongoDown  = "OAuth env may be set, but MongoDB is not connected. Check MONGO_DB_URI, Atlas Network Access (allow Cloud Run egress), and API logs for mongo: connect failed."
)

// HintMongoDown is the API JSON hint when env is complete but Mongo never connected.
func HintMongoDown() string { return hintMongoDown }

// MountStub registers JSON 503 handlers when auth deps are missing.
func MountStub(mux *http.ServeMux) {
	MountStubWithReason(mux, "auth_not_configured", hintMissingEnv)
}

// MountStubWithReason uses a specific error code and hint (e.g. mongo down vs missing env).
func MountStubWithReason(mux *http.ServeMux, errCode, hint string) {
	stub := func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusServiceUnavailable)
		_ = json.NewEncoder(w).Encode(map[string]string{
			"error": errCode,
			"hint":  hint,
		})
	}
	mux.HandleFunc("/api/auth/github", stub)
	mux.HandleFunc("/api/auth/github/callback", stub)
	mux.HandleFunc("/api/auth/me", func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodGet {
			http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
			return
		}
		w.Header().Set("Content-Type", "application/json")
		_ = json.NewEncoder(w).Encode(map[string]any{"user": nil})
	})
	mux.HandleFunc("/api/auth/logout", stub)
}
