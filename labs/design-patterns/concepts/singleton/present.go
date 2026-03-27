package singleton

import (
	"sync"
)

// Database represents an expensive shared resource.
type Database struct {
	conn string
}

var (
	instance *Database
	once     sync.Once
)

// GetInstance returns the sole Database instance.
// sync.Once guarantees the initializer runs exactly once,
// even under concurrent GetInstance calls.
func GetInstance() *Database {
	once.Do(func() {
		instance = &Database{conn: "postgres://tracelab"}
	})
	return instance
}

// Example: multiple packages call GetInstance — they share one DB.
func HandlerA() {
	db := GetInstance()
	_ = db.conn
}

func HandlerB() {
	db := GetInstance()
	_ = db.conn
}
