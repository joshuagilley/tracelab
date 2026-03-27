package transport

import (
	"net/http"
	"net/http/httputil"
	"net/url"
	"os"
	"strings"
)

// datascienceProxy forwards /api/datascience/* to the Python service (strip prefix).
// If DATASCIENCE_SERVICE_URL is unset, returns 503 JSON (static prod can omit Python).
func datascienceProxy() http.Handler {
	base := strings.TrimSpace(os.Getenv("DATASCIENCE_SERVICE_URL"))
	if base == "" {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusServiceUnavailable)
			w.Write([]byte(`{"error":"datascience_playground_offline","message":"Set DATASCIENCE_SERVICE_URL to enable the Python playground proxy."}`))
		})
	}

	u, err := url.Parse(base)
	if err != nil || u.Host == "" {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			http.Error(w, "invalid DATASCIENCE_SERVICE_URL", http.StatusInternalServerError)
		})
	}

	proxy := &httputil.ReverseProxy{
		Director: func(req *http.Request) {
			req.URL.Scheme = u.Scheme
			req.URL.Host = u.Host
			path := strings.TrimPrefix(req.URL.Path, "/api/datascience")
			if path == "" || path == "/" {
				path = "/"
			}
			if !strings.HasPrefix(path, "/") {
				path = "/" + path
			}
			req.URL.Path = path
			req.URL.RawPath = ""
		},
	}
	return proxy
}
