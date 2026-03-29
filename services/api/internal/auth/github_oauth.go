package auth

import (
	"context"
	"crypto/rand"
	"encoding/hex"
	"encoding/json"
	"io"
	"log"
	"net/http"
)

type githubUser struct {
	ID        int64  `json:"id"`
	Login     string `json:"login"`
	Name      string `json:"name"`
	AvatarURL string `json:"avatar_url"`
	Email     string `json:"email"`
}

func randomState() (string, error) {
	b := make([]byte, 16)
	if _, err := rand.Read(b); err != nil {
		return "", err
	}
	return hex.EncodeToString(b), nil
}

// fetchGitHubIdentityFromCode exchanges the OAuth code and loads the GitHub profile (+ primary email if needed).
// On failure returns (nil, redirectCode) where redirectCode is the auth_error query value for the SPA.
func (h *Handler) fetchGitHubIdentityFromCode(ctx context.Context, authCode string) (*githubUser, string) {
	tok, err := h.oauth.Exchange(ctx, authCode)
	if err != nil {
		log.Printf("auth: oauth token exchange: %v", err)
		return nil, "token_exchange"
	}
	client := h.oauth.Client(ctx, tok)

	gu, code := fetchGitHubUser(ctx, client)
	if code != "" {
		return nil, code
	}
	if gu.Email == "" {
		gu.Email = fetchPrimaryGitHubEmail(ctx, client)
	}
	return gu, ""
}

func fetchGitHubUser(ctx context.Context, client *http.Client) (*githubUser, string) {
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, "https://api.github.com/user", nil)
	if err != nil {
		log.Printf("auth: github /user request build: %v", err)
		return nil, "github_user"
	}
	resp, err := client.Do(req)
	if err != nil {
		log.Printf("auth: github /user request: %v", err)
		return nil, "github_user"
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(io.LimitReader(resp.Body, 1<<20))
	if err != nil {
		log.Printf("auth: github /user read body: %v", err)
		return nil, "github_user"
	}
	if resp.StatusCode != http.StatusOK {
		log.Printf("auth: github /user status %d", resp.StatusCode)
		return nil, "github_api"
	}

	var gu githubUser
	if err := json.Unmarshal(body, &gu); err != nil || gu.ID == 0 {
		return nil, "parse_user"
	}
	return &gu, ""
}

func fetchPrimaryGitHubEmail(ctx context.Context, client *http.Client) string {
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, "https://api.github.com/user/emails", nil)
	if err != nil {
		return ""
	}
	resp, err := client.Do(req)
	if err != nil {
		return ""
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(io.LimitReader(resp.Body, 1<<20))
	if err != nil {
		return ""
	}
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
