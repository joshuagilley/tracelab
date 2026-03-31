import type { CertificationOption } from '@/lib/certifications/api'

export const GENERALIST_CERTIFICATION: CertificationOption = {
  id: 'generalist',
  title: 'Generalist',
  roleKey: 'generalist',
  description: 'Complete all published concepts across TraceLab libraries.',
  imagePath: '/certifications/tl_software_engineer.png',
  trackTags: [],
  sortOrder: 5,
  active: true,
}

export const EXPERT_CERTIFICATION: CertificationOption = {
  id: 'expert',
  title: 'TraceLab Expert',
  roleKey: 'expert',
  description: 'Reserved for learners who complete all published TraceLab material.',
  imagePath: '/certifications/tl_expert.png',
  trackTags: [],
  sortOrder: 999,
  active: true,
}

export function withDefaultCertifications(certifications: CertificationOption[]): CertificationOption[] {
  const byId = new Map(certifications.map(item => [item.id, item]))
  if (!byId.has(GENERALIST_CERTIFICATION.id)) {
    byId.set(GENERALIST_CERTIFICATION.id, GENERALIST_CERTIFICATION)
  }
  return Array.from(byId.values()).sort((a, b) => a.sortOrder - b.sortOrder)
}
