package catalog

import "errors"

var (
	ErrLabNotFound         = errors.New("lab not found")
	ErrConceptNotInCatalog = errors.New("concept not in catalog")
)
