package concepts

type Difficulty string

const (
	Easy   Difficulty = "easy"
	Medium Difficulty = "medium"
	Hard   Difficulty = "hard"
)

type Concept struct {
	ID         string     `json:"id"`
	Title      string     `json:"title"`
	Slug       string     `json:"slug"`
	Summary    string     `json:"summary"`
	Difficulty Difficulty `json:"difficulty"`
	Tags       []string   `json:"tags"`
	Status     string     `json:"status"`
}
