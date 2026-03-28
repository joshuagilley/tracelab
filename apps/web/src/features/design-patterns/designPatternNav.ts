export interface DesignPatternNavItem {
  label: string
  /** API slug when a lesson exists */
  slug?: string
}

export interface DesignPatternNavSection {
  id: string
  title: string
  blurb: string
  items: DesignPatternNavItem[]
}

export const DESIGN_PATTERN_SECTIONS: DesignPatternNavSection[] = [
  {
    id: 'creational',
    title: 'Creational',
    blurb:
      'Object creation — flexible, controlled instantiation: when and how instances are built.',
    items: [
      { label: 'Singleton', slug: 'singleton' },
      { label: 'Factory Method' },
      { label: 'Abstract Factory' },
      { label: 'Builder' },
      { label: 'Prototype' },
      { label: 'Object Pool' },
      { label: 'Lazy Initialization' },
    ],
  },
  {
    id: 'structural',
    title: 'Structural',
    blurb:
      'How classes and objects combine into larger structures — simpler relationships between components.',
    items: [
      { label: 'Adapter' },
      { label: 'Decorator' },
      { label: 'Facade' },
      { label: 'Composite' },
      { label: 'Proxy' },
      { label: 'Bridge' },
      { label: 'Flyweight' },
    ],
  },
  {
    id: 'behavioral',
    title: 'Behavioral',
    blurb:
      'Communication and responsibility — workflows, interactions, and decision-making between objects.',
    items: [
      { label: 'Observer' },
      { label: 'Strategy' },
      { label: 'Command' },
      { label: 'Chain of Responsibility' },
      { label: 'Template Method' },
      { label: 'Iterator' },
      { label: 'State' },
      { label: 'Mediator' },
      { label: 'Memento' },
      { label: 'Visitor' },
    ],
  },
  {
    id: 'advanced',
    title: 'Advanced',
    blurb:
      'Architectural principles and deeper system design — scalable, robust enterprise-style systems.',
    items: [
      { label: 'SOLID Principles' },
      { label: 'DRY Principle' },
      { label: 'KISS Principle' },
      { label: 'YAGNI Principle' },
      { label: 'Dependency Injection', slug: 'dependency-injection' },
      { label: 'Composition vs Inheritance' },
      { label: 'Event-Driven Architecture' },
      { label: 'CQRS' },
      { label: 'Event Sourcing' },
      { label: 'CQRS vs Event Sourcing' },
      { label: 'Repository' },
      { label: 'MVC' },
    ],
  },
]
