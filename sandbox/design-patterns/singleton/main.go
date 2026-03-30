// Local sandbox — self-contained runnable main (not served by the API).
// Canonical lesson code: apps/web/src/components/design-patterns/creational/singleton/present.go
//
//	cd sandbox/design-patterns && go run ./singleton
package main

import (
	"fmt"
	"sync"
	"time"
)

type Logger struct {
	prefix string
}

var (
	instance *Logger
	once     sync.Once
)

func GetLogger() *Logger {
	once.Do(func() {
		instance = &Logger{prefix: fmt.Sprintf("[%s] ", time.Now().Format(time.RFC3339))}
	})
	return instance
}

func (l *Logger) Log(msg string) {
	fmt.Println(l.prefix + msg)
}

func main() {
	fmt.Println("=== Singleton demo: one Logger, many callers ===")
	fmt.Println()

	var wg sync.WaitGroup
	for i := 0; i < 5; i++ {
		wg.Add(1)
		go func(id int) {
			defer wg.Done()
			log := GetLogger()
			log.Log(fmt.Sprintf("goroutine %d", id))
			fmt.Printf("  goroutine %d sees logger at %p\n", id, log)
		}(i)
	}
	wg.Wait()

	final := GetLogger()
	fmt.Printf("\nMain sees the same instance:     %p\n", final)
	fmt.Println("(All pointers match — only one Logger was ever constructed.)")
	fmt.Println()

	GetLogger().Log("ServiceA started")
	GetLogger().Log("ServiceB started")
}
