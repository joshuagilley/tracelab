export interface CurriculumNavItem {
  label: string
  slug?: string
}

export interface CurriculumNavSection {
  id: string
  title: string
  blurb: string
  items: CurriculumNavItem[]
}
