package config

import (
	"os"
	"strings"
)

type Config struct {
	Addr string

	MongoURI       string
	MongoDBName    string
	UsersColl      string

	GitHubClientID     string
	GitHubClientSecret string
	// OAUTH_CALLBACK_URL is the exact URL registered in the GitHub OAuth app (e.g. http://localhost:5173/api/auth/github/callback when using the Vite proxy).
	OAuthCallbackURL string
	// FRONTEND_ORIGIN is where users are sent after login (e.g. http://localhost:5173 or https://app.example.com).
	FrontendOrigin string
	// Optional extra CORS origins (comma-separated), in addition to FrontendOrigin.
	CORSExtraOrigins []string

	JWTSecret string
	// AuthCookieCrossSite: when true, session cookies use SameSite=None; Secure (needed if the SPA and API are on different hosts, e.g. two Cloud Run services).
	AuthCookieCrossSite bool
}

func Load() *Config {
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	frontend := os.Getenv("FRONTEND_ORIGIN")
	if frontend == "" {
		frontend = "http://localhost:5173"
	}
	extra := []string{}
	if raw := strings.TrimSpace(os.Getenv("CORS_EXTRA_ORIGINS")); raw != "" {
		for _, p := range strings.Split(raw, ",") {
			if s := strings.TrimSpace(p); s != "" {
				extra = append(extra, s)
			}
		}
	}

	return &Config{
		Addr:               ":" + port,
		MongoURI:           strings.TrimSpace(os.Getenv("MONGO_DB_URI")),
		MongoDBName:        firstNonEmpty(os.Getenv("MONGO_DB_NAME"), "tracelab"),
		UsersColl:          firstNonEmpty(os.Getenv("USERS_COLLECTION"), "Users"),
		GitHubClientID:     strings.TrimSpace(os.Getenv("GITHUB_CLIENT_ID")),
		GitHubClientSecret: strings.TrimSpace(os.Getenv("GITHUB_CLIENT_SECRET")),
		OAuthCallbackURL:   trimTrailingSlash(strings.TrimSpace(os.Getenv("OAUTH_CALLBACK_URL"))),
		FrontendOrigin:     trimTrailingSlash(strings.TrimSpace(frontend)),
		CORSExtraOrigins:   extra,
		JWTSecret:          strings.TrimSpace(os.Getenv("AUTH_JWT_SECRET")),
		AuthCookieCrossSite: strings.EqualFold(strings.TrimSpace(os.Getenv("AUTH_COOKIE_CROSS_SITE")), "true"),
	}
}

func firstNonEmpty(a, b string) string {
	if strings.TrimSpace(a) != "" {
		return strings.TrimSpace(a)
	}
	return b
}

func trimTrailingSlash(s string) string {
	return strings.TrimSuffix(s, "/")
}

func (c *Config) CORSAllowedOrigins() []string {
	seen := map[string]struct{}{}
	var out []string
	add := func(o string) {
		o = strings.TrimSuffix(strings.TrimSpace(o), "/")
		if o == "" {
			return
		}
		if _, ok := seen[o]; ok {
			return
		}
		seen[o] = struct{}{}
		out = append(out, o)
	}
	add(c.FrontendOrigin)
	for _, o := range c.CORSExtraOrigins {
		add(o)
	}
	return out
}

func (c *Config) AuthConfigured() bool {
	return c.MongoURI != "" &&
		c.GitHubClientID != "" &&
		c.GitHubClientSecret != "" &&
		c.OAuthCallbackURL != "" &&
		c.JWTSecret != ""
}
