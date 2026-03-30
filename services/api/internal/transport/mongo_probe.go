package transport

import (
	"fmt"
	"net"
	"net/http"
	"os"
	"strings"
	"time"

	"github.com/tracelab/api/internal/config"
	"go.mongodb.org/mongo-driver/x/mongo/driver/connstring"
)

// mongoProbeHandler returns plain-text TCP dial results per host (Atlas / Mongo).
// Temporary debugging: verify Cloud Run → VPC/NAT can reach MongoDB ports.
//
// Hosts come from, in order:
//  1. MONGO_PROBE_HOSTS — comma-separated host:port (use for mongodb+srv when you need explicit shard hosts)
//  2. Hosts parsed from MONGO_DB_URI (works well for mongodb:// with listed hosts)
func mongoProbeHandler(cfg *config.Config) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodGet {
			http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
			return
		}
		hosts := hostsForMongoProbe(cfg)
		if len(hosts) == 0 {
			http.Error(w, "no hosts to probe: set MONGO_DB_URI or MONGO_PROBE_HOSTS (comma-separated host:port)", http.StatusServiceUnavailable)
			return
		}
		w.Header().Set("Content-Type", "text/plain; charset=utf-8")
		for _, host := range hosts {
			conn, err := net.DialTimeout("tcp", host, 5*time.Second)
			if err != nil {
				fmt.Fprintf(w, "%s -> FAIL: %v\n", host, err)
				continue
			}
			_ = conn.Close()
			fmt.Fprintf(w, "%s -> OK\n", host)
		}
	}
}

func hostsForMongoProbe(cfg *config.Config) []string {
	if raw := strings.TrimSpace(os.Getenv("MONGO_PROBE_HOSTS")); raw != "" {
		return splitHostPorts(raw)
	}
	uri := strings.TrimSpace(cfg.MongoURI)
	if uri == "" {
		return nil
	}
	cs, err := connstring.Parse(uri)
	if err != nil || len(cs.Hosts) == 0 {
		return nil
	}
	out := make([]string, 0, len(cs.Hosts))
	for _, h := range cs.Hosts {
		h = strings.TrimSpace(h)
		if h == "" {
			continue
		}
		if !strings.Contains(h, ":") {
			h = net.JoinHostPort(h, "27017")
		}
		out = append(out, h)
	}
	return out
}

func splitHostPorts(raw string) []string {
	var out []string
	for _, p := range strings.Split(raw, ",") {
		p = strings.TrimSpace(p)
		if p == "" {
			continue
		}
		if !strings.Contains(p, ":") {
			p = net.JoinHostPort(p, "27017")
		}
		out = append(out, p)
	}
	return out
}
