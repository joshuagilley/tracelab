package lessons

// Lesson is one catalog entry for a section (system-design, design-patterns, data-science).
// List responses omit code; Get hydrates codeFiles from embed.
type Lesson struct {
	ID         string      `json:"id"`
	Title      string      `json:"title"`
	Slug       string      `json:"slug"`
	Summary    string      `json:"summary"`
	Difficulty string      `json:"difficulty"`
	Tags       []string    `json:"tags"`
	Status     string      `json:"status"`
	LabKind    string      `json:"labKind"`
	VizType    string      `json:"vizType"`
	CodeFiles  []CodeFile  `json:"codeFiles"`
	Parameters []Parameter `json:"parameters,omitempty"`
}

// LessonSummary is returned from GET .../concepts (no embedded source).
type LessonSummary struct {
	ID         string   `json:"id"`
	Title      string   `json:"title"`
	Slug       string   `json:"slug"`
	Summary    string   `json:"summary"`
	Difficulty string   `json:"difficulty"`
	Tags       []string `json:"tags"`
	Status     string   `json:"status"`
}

type CodeFile struct {
	Name  string `json:"name"`
	Lang  string `json:"lang"`
	Code  string `json:"code,omitempty"`
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

func summaryFromLesson(l Lesson) LessonSummary {
	return LessonSummary{
		ID:         l.ID,
		Title:      l.Title,
		Slug:       l.Slug,
		Summary:    l.Summary,
		Difficulty: l.Difficulty,
		Tags:       l.Tags,
		Status:     l.Status,
	}
}
