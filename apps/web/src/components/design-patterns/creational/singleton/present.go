package singleton

import (
	"fmt"
	"sync"
	"time"
)

// Logger is an expensive shared resource — one writer, one prefix, one instance.
type Logger struct {
	prefix string
}

var (
	instance *Logger
	once     sync.Once
)

// GetLogger returns the sole Logger instance.
// sync.Once guarantees the initializer runs exactly once,
// even under concurrent GetLogger calls.
func GetLogger() *Logger {
	once.Do(func() {
		instance = &Logger{prefix: fmt.Sprintf("[%s] ", time.Now().Format(time.RFC3339))}
	})
	return instance
}

func (l *Logger) Log(msg string) {
	fmt.Println(l.prefix + msg)
}

// Example: multiple services call GetLogger — they share one Logger.
func ServiceA() {
	log := GetLogger()
	log.Log("ServiceA started")
}

func ServiceB() {
	log := GetLogger()
	log.Log("ServiceB started")
}
