export interface ProgrammingLanguageTopic {
  label: string
  slug?: string
}

export interface ProgrammingLanguageCategory {
  id: string
  title: string
  blurb: string
  items: ProgrammingLanguageTopic[]
}

export interface ProgrammingLanguage {
  id: string
  title: string
  blurb: string
  categories: ProgrammingLanguageCategory[]
}
