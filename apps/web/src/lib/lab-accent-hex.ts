import type { LabId } from '@/contexts/lab'

/** Matches `globals.css` `.lab-theme-*` `--accent` values for use outside themed subtrees. */
export const LAB_ACCENT_HEX: Record<LabId, string> = {
  'system-design': '#3de8a0',
  'api-design': '#f59e0b',
  'design-patterns': '#f0a040',
  'data-science': '#f04d4d',
  'database-design': '#5b9cf5',
  'cloud-architecture': '#b565e8',
  concurrency: '#2dd4bf',
  networking: '#60a5fa',
  security: '#f43f5e',
  'software-architecture': '#818cf8',
  testing: '#a3e635',
  devops: '#fb923c',
  'low-level-systems': '#c4b5fd',
  'operating-systems': '#2dd4bf',
  algorithms: '#e879f9',
  'ai-systems': '#22d3ee',
  'programming-languages': '#9aa3b5',
}
