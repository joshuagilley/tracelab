package completed

import (
	"context"
	"strings"
	"testing"
	"time"
)

func TestGoRunner_Run_passes(t *testing.T) {
	g := NewGoRunner(45 * time.Second)
	ctx := context.Background()
	res, err := g.Run(ctx, "package main\n\nfunc main() {}\n", CanonicalPracticeFiles{
		GoMod: "module tracelab_submit_test\n\ngo 1.25.0\n",
		Test: `package main

import "testing"

func TestOK(t *testing.T) {}`,
	})
	if err != nil {
		t.Fatal(err)
	}
	if !res.Passed {
		t.Fatalf("expected pass, output:\n%s", res.Output)
	}
}

func TestGoRunner_Run_failsOnTestFailure(t *testing.T) {
	g := NewGoRunner(45 * time.Second)
	ctx := context.Background()
	res, err := g.Run(ctx, "package main\n\nfunc main() {}\n", CanonicalPracticeFiles{
		GoMod: "module tracelab_submit_test_fail\n\ngo 1.25.0\n",
		Test: `package main

import "testing"

func TestFail(t *testing.T) {
	t.Fatal("expected failure")
}`,
	})
	if err != nil {
		t.Fatal(err)
	}
	if res.Passed {
		t.Fatal("expected failure")
	}
	if !strings.Contains(res.Output, "expected failure") {
		t.Fatalf("unexpected output: %s", res.Output)
	}
}

func TestTruncateRunnerOutput(t *testing.T) {
	s := strings.Repeat("a", maxRunnerOutputBytes+100)
	out := truncateRunnerOutput(s)
	if len(out) >= len(s) {
		t.Fatalf("expected shorter output: in=%d out=%d", len(s), len(out))
	}
	if !strings.HasSuffix(out, "… (output truncated)\n") {
		t.Fatalf("missing suffix: len(out)=%d", len(out))
	}
}
