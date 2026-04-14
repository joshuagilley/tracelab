package labconfig

import "testing"

func TestLabsAllowlist_Basenames(t *testing.T) {
	t.Parallel()
	a := &LabsAllowlist{byLang: map[string]map[string]struct{}{
		"go": {"main.go": {}, "main_test.go": {}},
	}}
	got := a.Basenames("go")
	if len(got) != 2 {
		t.Fatalf("go allowlist: want 2 entries, got %d", len(got))
	}
	if _, ok := got["main.go"]; !ok {
		t.Fatal("missing main.go")
	}
	if a.Basenames("rust") != nil {
		t.Fatal("unknown language should return nil (no filtering)")
	}
}

func TestLabsAllowlist_Basenames_nilReceiver(t *testing.T) {
	t.Parallel()
	var a *LabsAllowlist
	if a.Basenames("go") != nil {
		t.Fatal("nil allowlist should mean no filter")
	}
}
