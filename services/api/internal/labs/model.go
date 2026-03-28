package labs

// LabConcept is served as static JSON for design-patterns and data-science labs.
type LabConcept struct {
	ID          string   `json:"id"`
	Title       string   `json:"title"`
	Slug        string   `json:"slug"`
	Summary     string   `json:"summary"`
	Difficulty  string   `json:"difficulty"`
	Tags        []string `json:"tags"`
	Status      string   `json:"status"`
	LabKind     string   `json:"labKind"`
	VizType     string   `json:"vizType"`
	CodeFiles   []CodeFile `json:"codeFiles"`
	Parameters  []Parameter `json:"parameters,omitempty"`
}

type CodeFile struct {
	Name string `json:"name"`
	Lang string `json:"lang"`
	// Code is filled from Embed at load time for design-patterns and data-science labs.
	Code string `json:"code,omitempty"`
	// Embed is a path relative to internal/labs/embed/{lab}/ (e.g. singleton/present.go, numerical-computing/present.py).
	Embed string `json:"embed,omitempty"`
}

type Parameter struct {
	ID            string   `json:"id"`
	Label         string   `json:"label"`
	Type          string   `json:"type"`
	Options       []string `json:"options,omitempty"`
	DefaultOption string   `json:"defaultOption,omitempty"`
	Min           float64  `json:"min,omitempty"`
	Max           float64  `json:"max,omitempty"`
	Step          float64  `json:"step,omitempty"`
	Default       float64  `json:"default,omitempty"`
}
