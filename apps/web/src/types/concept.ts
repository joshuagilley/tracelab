export type Difficulty = 'easy' | 'medium' | 'hard';

export type ConceptStatus = 'available' | 'coming-soon';

export interface Concept {
  id: string;
  title: string;
  slug: string;
  summary: string;
  difficulty: Difficulty;
  tags: string[];
  status: ConceptStatus;
}
