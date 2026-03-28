# Database Design — TraceLab curriculum notes

How data is modeled, stored, queried, and scaled in real systems.

Design principle: **not** a giant theory bucket. Each topic should answer:

- What problem is this solving?
- What does the data shape look like?
- What does the diagram look like?
- What tiny code example proves it?

Each lesson should fit: **one diagram**, **one small code sample**, **one practical takeaway**.

---

## Sidebar sections (UI)

1. **Foundations**
2. **Modeling**
3. **Performance**
4. **Scaling**
5. **Consistency**
6. **Caching**

---

## 1. Foundations

Easiest “single diagram + small code” lessons.

| Topic | Diagram | Code |
|-------|---------|------|
| What Is a Database? | app → database | simple insert/select |
| Relational vs Non-Relational Databases | tables vs documents | SQL row vs JSON document |
| SQL vs NoSQL | structured schema vs flexible schema | `SELECT * FROM users` vs Mongo find |
| Schema Design Basics | users, orders, products tables | basic schema definition |
| Primary Keys and Foreign Keys | relationship lines between tables | small SQL schema with FK |

---

## 2. Data Modeling

Schema is about **access patterns**, not just correctness.

| Topic | Diagram | Code |
|-------|---------|------|
| One-to-One, One-to-Many, Many-to-Many | user/profile, user/orders, posts/tags | table definitions or document structure |
| Normalization | one big messy table → smaller ones | before/after schema |
| Denormalization | joined data vs duplicated fast-read data | embedded document or duplicated column |
| Embeds vs References | document inside document vs linked IDs | Mongo-style example |
| Designing for Read Patterns | query-driven schema flow | schema shaped around top queries |

---

## 3. Query Performance

| Topic | Diagram | Code |
|-------|---------|------|
| What an Index Does | full scan vs index lookup | query before/after index |
| When Indexes Hurt | faster reads, slower writes | insert/update cost |
| Composite Indexes | ordered index on `(user_id, created_at)` | matching query example |
| Query Optimization Basics | filter → scan → result | bad query vs better query |
| Pagination | offset vs cursor | `LIMIT/OFFSET` vs cursor query |

---

## 4. Scaling Data

| Topic | Diagram | Code |
|-------|---------|------|
| Vertical vs Horizontal Scaling | one bigger DB vs many nodes | config-ish |
| Replication | primary → replicas | read replica / write primary pseudocode |
| Sharding | users split across shard A/B/C | shard key routing |
| Partitioning | table split by date or tenant | partition key example |
| Hot Partitions | one shard overloaded | bad shard key vs better shard key |

---

## 5. Reliability and Consistency

Keep practical, not overly textbook.

| Topic | Diagram | Code |
|-------|---------|------|
| Transactions | begin → writes → commit/rollback | SQL transaction example |
| ACID Basics | transaction guarantees flow | bank transfer example |
| Eventual Consistency | write accepted, replicas catch up | stale read scenario |
| Replication Lag | primary updated, replica behind | read-after-write inconsistency |
| Backup and Restore | prod → snapshot → restore | config / pseudocode |

---

## 6. Caching and Fast Reads

| Topic | Diagram | Code |
|-------|---------|------|
| Database vs Cache | app → cache → DB | cache-aside example |
| Cache-Aside Pattern | miss → DB → populate cache | Redis lookup flow |
| Write-Through vs Write-Behind | app write paths | two write strategies |
| Cache Invalidation | stale cache after DB update | update + invalidate |
| Read-Heavy System Design | replicas + cache layer | simplified service logic |

---

## MVP topics (first batch)

**Foundations:** What Is a Database?, SQL vs NoSQL, Primary Keys and Foreign Keys  

**Modeling:** One-to-Many Relationships, Normalization, Embeds vs References  

**Performance:** What an Index Does, Composite Indexes, Pagination  

**Scaling:** Replication, Sharding  

**Consistency:** Transactions, Eventual Consistency  

**Caching:** Cache-Aside Pattern  

---

## Lesson page template

1. **Concept** — one paragraph; one-sentence problem statement  
2. **Diagram** — one system/data diagram  
3. **Code** — one small example (SQL, Go service, or Mongo-style)  
4. **Tradeoffs** — when to use / when not  
5. **Bad vs good** — TraceLab `present` / `bad` panels  

---

## Example topic breakdowns

**Indexing** — diagram: full scan vs indexed lookup; code: `CREATE INDEX` + query; takeaway: faster reads, more write cost.

**Replication** — diagram: primary + two read replicas; code: write primary, read replica; takeaway: scale reads, lag tradeoff.

**Normalization** — diagram: messy orders table → users/orders/products; code: before/after schema; takeaway: less duplication, more joins.

**Cache-Aside** — diagram: app → cache → DB; code: miss → fetch DB → set cache; takeaway: hot reads faster, invalidation harder.

---

## Recommendation

Organize around:

- What developers actually hit in production  
- What can be visualized  
- What fits in ~30–80 lines of code  

Each topic: **one database idea, one picture, one runnable example, one tradeoff** — not a “complete reference” dump.
