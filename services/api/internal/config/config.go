package config

import (
	"log"
	"os"
	"strings"
)

type Config struct {
	Addr string

	MongoURI           string
	MongoDBName        string
	UsersColl          string
	CertificationsColl string
	// CompletedColl stores one document per completed concept (see completed).
	CompletedColl string
	// LabsColl / ConceptsColl hold curriculum catalog documents (see catalog).
	LabsColl     string
	ConceptsColl string
	// BadgeEmailsColl stores sent badge email receipts for idempotency.
	BadgeEmailsColl string

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

	SMTPHost string
	SMTPPort string
	SMTPUser string
	SMTPPass string
	SMTPFrom string
}

func Load() *Config {
	frontend := envDefault("FRONTEND_ORIGIN", "http://localhost:5173")

	return &Config{
		Addr:     ":" + envDefault("PORT", "8080"),
		MongoURI: env("MONGO_DB_URI"),
		// "tracelab" only if MONGO_DB_NAME is unset (see repo-root .env via `make api` / `make dev`).
		MongoDBName:         envDefault("MONGO_DB_NAME", "tracelab"),
		UsersColl:           envDefault("USERS_COLLECTION", "Users"),
		CertificationsColl:  envDefault("CERTIFICATIONS_COLLECTION", "Certifications"),
		CompletedColl:       envDefault("COMPLETED_COLLECTION", "Completed"),
		LabsColl:            envDefault("LABS_COLLECTION", "Labs"),
		ConceptsColl:        envDefault("CONCEPTS_COLLECTION", "Concepts"),
		BadgeEmailsColl:     envDefault("BADGE_EMAILS_COLLECTION", "BadgeEmails"),
		GitHubClientID:      env("GITHUB_CLIENT_ID"),
		GitHubClientSecret:  env("GITHUB_CLIENT_SECRET"),
		OAuthCallbackURL:    normalizeURLish(env("OAUTH_CALLBACK_URL")),
		FrontendOrigin:      normalizeURLish(frontend),
		CORSExtraOrigins:    envCSV("CORS_EXTRA_ORIGINS"),
		JWTSecret:           env("AUTH_JWT_SECRET"),
		AuthCookieCrossSite: envBool("AUTH_COOKIE_CROSS_SITE"),
		SMTPHost:            env("SMTP_HOST"),
		SMTPPort:            envDefault("SMTP_PORT", "587"),
		SMTPUser:            env("SMTP_USER"),
		SMTPPass:            env("SMTP_PASS"),
		SMTPFrom:            env("SMTP_FROM"),
	}
}

func env(key string) string {
	return strings.TrimSpace(os.Getenv(key))
}

func envDefault(key, fallback string) string {
	if v := env(key); v != "" {
		return v
	}
	return fallback
}

func envBool(key string) bool {
	return strings.EqualFold(env(key), "true")
}

func envCSV(key string) []string {
	raw := env(key)
	if raw == "" {
		return nil
	}
	out := make([]string, 0)
	for _, part := range strings.Split(raw, ",") {
		if v := strings.TrimSpace(part); v != "" {
			out = append(out, v)
		}
	}
	return out
}

// normalizeURLish trims space and a trailing slash from URL-like config (origins, callback URLs).
func normalizeURLish(s string) string {
	return strings.TrimSuffix(strings.TrimSpace(s), "/")
}

func (c *Config) CORSAllowedOrigins() []string {
	seen := make(map[string]struct{})
	out := make([]string, 0, 1+len(c.CORSExtraOrigins))

	add := func(origin string) {
		origin = normalizeURLish(origin)
		if origin == "" {
			return
		}
		if _, ok := seen[origin]; ok {
			return
		}
		seen[origin] = struct{}{}
		out = append(out, origin)
	}

	add(c.FrontendOrigin)
	for _, origin := range c.CORSExtraOrigins {
		add(origin)
	}
	return out
}

// OAuthConfigured reports whether GitHub OAuth and JWT settings needed for the auth flow are present.
func (c *Config) OAuthConfigured() bool {
	return c.GitHubClientID != "" &&
		c.GitHubClientSecret != "" &&
		c.OAuthCallbackURL != "" &&
		c.JWTSecret != ""
}

// AuthConfigured reports whether auth can run end-to-end in this app (OAuth env + Mongo URI for persistence).
func (c *Config) AuthConfigured() bool {
	return c.MongoURI != "" && c.OAuthConfigured()
}

// LogAuthEnvDiagnostics logs which auth-related env vars are set (no secret values).
func (c *Config) LogAuthEnvDiagnostics() {
	log.Printf("auth: env mongo=%v github_id=%v github_secret=%v oauth_callback=%v jwt=%v | frontend=%q callback=%q",
		c.MongoURI != "",
		c.GitHubClientID != "",
		c.GitHubClientSecret != "",
		c.OAuthCallbackURL != "",
		c.JWTSecret != "",
		c.FrontendOrigin,
		c.OAuthCallbackURL,
	)
}
