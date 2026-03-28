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
    title: 'Creational Design Patterns',
    blurb:
      'These Creational Design Patterns deal with object creation in a flexible and efficient manner. They help you control how and when objects are instantiated.',
    items: [
      { label: 'Singleton Pattern', slug: 'singleton' },
      { label: 'Factory Method Pattern' },
      { label: 'Abstract Factory Pattern' },
      { label: 'Builder Pattern' },
      { label: 'Prototype Pattern' },
      { label: 'Object Pool Pattern' },
      { label: 'Lazy Initialization' },
    ],
  },
  {
    id: 'structural',
    title: 'Structural Design Patterns',
    blurb:
      'Structural patterns explain how classes and objects are combined to form larger structures. They improve code flexibility by simplifying relationships between components.',
    items: [
      { label: 'Adapter Pattern' },
      { label: 'Decorator Pattern' },
      { label: 'Facade Pattern' },
      { label: 'Composite Pattern' },
      { label: 'Proxy Pattern' },
      { label: 'Bridge Pattern' },
      { label: 'Flyweight Pattern' },
    ],
  },
  {
    id: 'behavioral',
    title: 'Behavioral Design Patterns',
    blurb:
      'Behavioral patterns define how objects communicate and distribute responsibilities. They help manage workflows, interactions, and decision-making within a system.',
    items: [
      { label: 'Observer Pattern' },
      { label: 'Strategy Pattern' },
      { label: 'Command Pattern' },
      { label: 'Chain of Responsibility Pattern' },
      { label: 'Template Method Pattern' },
      { label: 'Iterator Pattern' },
      { label: 'State Pattern' },
      { label: 'Mediator Pattern' },
      { label: 'Memento Pattern' },
      { label: 'Visitor Pattern' },
    ],
  },
  {
    id: 'advanced',
    title: 'Advanced Design Pattern',
    blurb:
      'Advanced topics cover architectural principles and deeper system-design concepts. They help you build enterprise-level, scalable, and robust software systems.',
    items: [
      { label: 'SOLID Principles' },
      { label: 'DRY Principle' },
      { label: 'KISS Principle' },
      { label: 'YAGNI Principle' },
      { label: 'Dependency Injection Pattern', slug: 'dependency-injection' },
      { label: 'Composition Vs Inheritance' },
      { label: 'Event-Driven Architecture' },
      { label: 'CQRS Design Pattern' },
      { label: 'Event Sourcing Patterns' },
      { label: 'CQRS Vs Event Sourcing Patterns' },
      { label: 'Repository Pattern' },
      { label: 'MVC Design Pattern' },
    ],
  },
]
