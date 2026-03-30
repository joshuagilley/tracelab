//go:build ignore

package main

// Idiomatic reference: HTTP reverse proxy + two toy backends + round-robin LB.
// Not part of `go test`. From this directory: go run present.go

import (
	"log"
	"net/http"
	"net/http/httputil"
	"net/url"
	"strconv"
	"sync/atomic"
)

type Backend struct {
	URL *url.URL
}

type HTTPLoadBalancer struct {
	backends []*Backend
	counter  uint64
}

func (lb *HTTPLoadBalancer) nextBackend() *Backend {
	idx := atomic.AddUint64(&lb.counter, 1)
	return lb.backends[(idx-1)%uint64(len(lb.backends))]
}

func (lb *HTTPLoadBalancer) serveProxy(w http.ResponseWriter, r *http.Request) {
	backend := lb.nextBackend()
	log.Printf("Forwarding %s %s to %s\n", r.Method, r.URL.Path, backend.URL)

	proxy := httputil.NewSingleHostReverseProxy(backend.URL)
	proxy.ErrorHandler = func(w http.ResponseWriter, r *http.Request, err error) {
		http.Error(w, "backend unavailable", http.StatusBadGateway)
		log.Printf("proxy error: %v\n", err)
	}

	proxy.ServeHTTP(w, r)
}

func startBackend(port int, name string) {
	mux := http.NewServeMux()

	mux.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		log.Printf("[%s] received request %s\n", name, r.URL.Path)
		w.Header().Set("Content-Type", "text/plain")
		w.Write([]byte("Response from " + name + " on port " + strconv.Itoa(port) + "\n"))
	})

	go func() {
		addr := ":" + strconv.Itoa(port)
		log.Printf("%s listening on %s\n", name, addr)
		if err := http.ListenAndServe(addr, mux); err != nil {
			log.Fatalf("%s failed: %v", name, err)
		}
	}()
}

func main() {
	startBackend(8081, "backend-A")
	startBackend(8082, "backend-B")

	backend1, _ := url.Parse("http://localhost:8081")
	backend2, _ := url.Parse("http://localhost:8082")

	lb := &HTTPLoadBalancer{
		backends: []*Backend{
			{URL: backend1},
			{URL: backend2},
		},
	}

	mux := http.NewServeMux()
	mux.HandleFunc("/", lb.serveProxy)

	log.Println("load balancer listening on :8080")
	if err := http.ListenAndServe(":8080", mux); err != nil {
		log.Fatal(err)
	}
}
