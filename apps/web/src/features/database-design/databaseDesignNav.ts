export interface DatabaseDesignNavItem {
  label: string
  slug?: string
}

export interface DatabaseDesignNavSection {
  id: string
  title: string
  blurb: string
  items: DatabaseDesignNavItem[]
}

export const DATABASE_DESIGN_SECTIONS: DatabaseDesignNavSection[] = [
  {
    id: 'foundations',
    title: 'Foundations',
    blurb: 'Single-diagram, small-code lessons: what a database is, relational vs document, and how keys wire tables together.',
    items: [
      { label: 'What Is a Database?' },
      { label: 'Relational vs Non-Relational Databases' },
      { label: 'SQL vs NoSQL' },
      { label: 'Schema Design Basics' },
      { label: 'Primary Keys and Foreign Keys', slug: 'primary-keys-foreign-keys' },
    ],
  },
  {
    id: 'modeling',
    title: 'Modeling',
    blurb: 'Schema follows access patterns — cardinality, normalization, denormalization, and document modeling choices.',
    items: [
      { label: 'One-to-One, One-to-Many, Many-to-Many' },
      { label: 'Normalization' },
      { label: 'Denormalization' },
      { label: 'Embeds vs References' },
      { label: 'Designing for Read Patterns' },
    ],
  },
  {
    id: 'performance',
    title: 'Performance',
    blurb: 'Indexes, query shape, and pagination — each maps cleanly to a before/after code snippet.',
    items: [
      { label: 'What an Index Does' },
      { label: 'When Indexes Hurt' },
      { label: 'Composite Indexes' },
      { label: 'Query Optimization Basics' },
      { label: 'Pagination' },
    ],
  },
  {
    id: 'scaling',
    title: 'Scaling',
    blurb: 'Vertical vs horizontal growth, replication, sharding, partitioning, and hot partitions.',
    items: [
      { label: 'Vertical vs Horizontal Scaling' },
      { label: 'Replication' },
      { label: 'Sharding' },
      { label: 'Partitioning' },
      { label: 'Hot Partitions' },
    ],
  },
  {
    id: 'consistency',
    title: 'Consistency',
    blurb: 'Transactions, ACID, eventual consistency, replication lag, backups — kept practical and narrow.',
    items: [
      { label: 'Transactions' },
      { label: 'ACID Basics' },
      { label: 'Eventual Consistency' },
      { label: 'Replication Lag' },
      { label: 'Backup and Restore' },
    ],
  },
  {
    id: 'caching',
    title: 'Caching',
    blurb: 'Cache-aside, write strategies, invalidation, and read-heavy topologies next to the database.',
    items: [
      { label: 'Database vs Cache' },
      { label: 'Cache-Aside Pattern' },
      { label: 'Write-Through vs Write-Behind' },
      { label: 'Cache Invalidation' },
      { label: 'Read-Heavy System Design' },
    ],
  },
]
