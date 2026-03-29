//go:build ignore

// Anti-pattern: every caller creates a new Logger.
// No shared instance, duplicate setup, inconsistent prefixes across the process.
package singletonbad

import (
	"fmt"
	"time"
)

type Logger struct {
	prefix string
}

// NewLogger creates a brand-new Logger each time — no reuse.
func NewLogger() *Logger {
	return &Logger{prefix: fmt.Sprintf("[%s] ", time.Now().Format(time.RFC3339))}
}

func (l *Logger) Log(msg string) {
	fmt.Println(l.prefix + msg)
}

// Every caller constructs its own Logger — duplicate setup, no shared state.
func ServiceA() {
	log := NewLogger()
	log.Log("ServiceA started")
}

func ServiceB() {
	log := NewLogger()
	log.Log("ServiceB started")
}
