package main

import "testing"

func TestSetGetRoundTrip(t *testing.T) {
	c := NewCache()
	c.Set("language", "Go")
	v, ok := c.Get("language")
	if !ok {
		t.Fatal("expected hit after Set")
	}
	if v != "Go" {
		t.Fatalf("got %q, want Go", v)
	}
}

func TestGetMissing(t *testing.T) {
	c := NewCache()
	_, ok := c.Get("nope")
	if ok {
		t.Fatal("expected miss")
	}
}

func TestOverwrite(t *testing.T) {
	c := NewCache()
	c.Set("k", "a")
	c.Set("k", "b")
	v, ok := c.Get("k")
	if !ok || v != "b" {
		t.Fatalf("got (%q, %v), want (b, true)", v, ok)
	}
}
