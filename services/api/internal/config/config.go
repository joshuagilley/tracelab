package config

import "os"

type Config struct {
	Addr string
}

func Load() *Config {
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	return &Config{Addr: ":" + port}
}
