import type { Concept } from '@/types/concept';

const BASE = '/api';

export async function fetchConcepts(): Promise<Concept[]> {
  const res = await fetch(`${BASE}/concepts`);
  if (!res.ok) throw new Error(`Failed to fetch concepts: ${res.status}`);
  return res.json();
}

export async function fetchConcept(slug: string): Promise<Concept> {
  const res = await fetch(`${BASE}/concepts/${slug}`);
  if (!res.ok) throw new Error(`Concept "${slug}" not found`);
  return res.json();
}
