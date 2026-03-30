package main

import (
	"fmt"

	"caching-practice/cache"
)

func main() {
	c := cache.New()

	c.Set("framework", "TraceLab")

	value, ok := c.Get("framework")
	if !ok {
		fmt.Println("miss")
		return
	}

	fmt.Println("hit:", value)
}
