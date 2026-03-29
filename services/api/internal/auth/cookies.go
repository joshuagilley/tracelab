package auth

import (
	"log"
	"net"
	"net/http"
	"net/url"
	"strings"
	"time"
)

const (
	oauthStateCookie = "oauth_state"
	stateCookieTTL   = 10 * time.Minute
	sessionTTL = 30 * 24 * time.Hour
)

func (h *Handler) newCookie(r *http.Request, name, value string, maxAge int) *http.Cookie {
	same, secure := h.cookieAttrsFor(r)
	return &http.Cookie{
		Name:     name,
		Value:    value,
		Path:     "/",
		MaxAge:   maxAge,
		HttpOnly: true,
		SameSite: same,
		Secure:   secure,
	}
}

func (h *Handler) sessionCookie(r *http.Request, value string) *http.Cookie {
	return h.newCookie(r, CookieName, value, int(sessionTTL.Seconds()))
}

func (h *Handler) stateCookie(r *http.Request, value string) *http.Cookie {
	return h.newCookie(r, oauthStateCookie, value, int(stateCookieTTL.Seconds()))
}

func (h *Handler) clearCookie(r *http.Request, name string) *http.Cookie {
	return h.newCookie(r, name, "", -1)
}

func (h *Handler) cookieAttrsFor(r *http.Request) (http.SameSite, bool) {
	if h.cfg.AuthCookieCrossSite {
		return http.SameSiteNoneMode, true
	}
	fh := originHost(h.cfg.FrontendOrigin)
	rh := hostOnly(r.Host)
	if fh != "" && rh != "" && fh != rh {
		h.crossSiteLog.Do(func() {
			log.Printf("auth: cross-host cookies api=%q spa=%q (SameSite=None)", rh, fh)
		})
		return http.SameSiteNoneMode, true
	}
	secure := strings.HasPrefix(h.cfg.FrontendOrigin, "https://")
	return http.SameSiteLaxMode, secure
}

func hostOnly(hostport string) string {
	hostport = strings.TrimSpace(hostport)
	if hostport == "" {
		return ""
	}
	host, _, err := net.SplitHostPort(hostport)
	if err != nil {
		return strings.ToLower(hostport)
	}
	return strings.ToLower(host)
}

func originHost(origin string) string {
	u, err := url.Parse(strings.TrimSpace(origin))
	if err != nil || u.Host == "" {
		return ""
	}
	return hostOnly(u.Host)
}
