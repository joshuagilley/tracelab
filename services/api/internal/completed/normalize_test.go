package completed

import "testing"

func TestNormalizedBaseName(t *testing.T) {
	if got := normalizedBaseName(`pkg\main.go`); got != "main.go" {
		t.Fatalf("got %q", got)
	}
	if got := normalizedBaseName("main.go"); got != "main.go" {
		t.Fatalf("got %q", got)
	}
}

func TestPickSubmittedFile(t *testing.T) {
	files := []SubmittedFile{
		{Name: "src/main.go", Content: "x"},
		{Name: "other.txt", Content: "y"},
	}
	got, ok := pickSubmittedFile(files, "main.go")
	if !ok || got != "x" {
		t.Fatalf("got %q ok=%v", got, ok)
	}
	_, ok = pickSubmittedFile(files, "missing.go")
	if ok {
		t.Fatal("expected miss")
	}
}

func TestStripBuildConstraintsFromSubmittedMain(t *testing.T) {
	in := "//go:build ignore\n// +build ignore\n\npackage main\nfunc main() {}\n"
	out := stripBuildConstraintsFromSubmittedMain(in)
	if want := "package main\nfunc main() {}\n"; out != want {
		t.Fatalf("got %q want %q", out, want)
	}
}
