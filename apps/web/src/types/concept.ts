export type Difficulty = 'easy' | 'medium' | 'hard';

export type ConceptStatus = 'available' | 'coming-soon';

export interface Concept {
  id: string;
  title: string;
  slug: string;
  summary: string;
  difficulty: Difficulty;
  /** Optional keywords / UX chips — not used for career-track membership. */
  tags?: string[];
  /** Career certifications this concept counts toward (`Concepts.certification_ids` in Mongo). */
  certificationIds?: string[];
  status: ConceptStatus;
}
