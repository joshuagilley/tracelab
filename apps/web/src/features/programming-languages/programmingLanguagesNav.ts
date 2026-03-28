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

/**
 * Mental models and runtime behavior — not syntax tutorials. Ties to Concurrency,
 * Low-Level Systems, and API tracks where each language intersects them.
 */
export const PROGRAMMING_LANGUAGES: ProgrammingLanguage[] = [
  {
    id: 'javascript',
    title: 'JavaScript',
    blurb: 'The language of the browser and event-driven systems.',
    categories: [
      {
        id: 'core',
        title: 'Core concepts',
        blurb: 'What makes JS expressive — functions, scope, and object behavior.',
        items: [
          { label: 'Closures' },
          { label: 'Prototypes & inheritance' },
          { label: 'First-class functions' },
          { label: 'Scope (var vs let vs const)' },
        ],
      },
      {
        id: 'runtime',
        title: 'Runtime & execution',
        blurb: 'How JS schedules work — one thread, many callbacks.',
        items: [
          { label: 'Event loop' },
          { label: 'Call stack' },
          { label: 'Microtasks vs macrotasks' },
          { label: 'Async / await' },
        ],
      },
      {
        id: 'concurrency',
        title: 'Concurrency model',
        blurb: 'Cooperative multitasking without threads — compare to goroutines (Go) or asyncio (Python).',
        items: [
          { label: 'Single-threaded execution' },
          { label: 'Non-blocking I/O' },
          { label: 'Promises' },
        ],
      },
      {
        id: 'data',
        title: 'Data & memory',
        blurb: 'How values live and get reclaimed — GC at the language level.',
        items: [
          { label: 'Objects vs Maps' },
          { label: 'Reference vs value' },
          { label: 'Garbage collection' },
        ],
      },
      {
        id: 'ecosystem',
        title: 'Ecosystem & patterns',
        blurb: 'Where JS ships in real systems — servers, APIs, and UIs.',
        items: [
          { label: 'Node.js runtime' },
          { label: 'Express APIs' },
          { label: 'Frontend state (React basics)' },
        ],
      },
      {
        id: 'gotchas',
        title: 'Gotchas & pitfalls',
        blurb: 'The bugs that trip people at scale.',
        items: [
          { label: 'this binding' },
          { label: 'Hoisting' },
          { label: 'Async bugs' },
        ],
      },
    ],
  },
  {
    id: 'typescript',
    title: 'TypeScript',
    blurb: 'JavaScript with a static type layer — design-time safety on the same runtime as JS.',
    categories: [
      {
        id: 'core',
        title: 'Core concepts',
        blurb: 'How types describe JS values without changing runtime shape.',
        items: [
          { label: 'Structural typing' },
          { label: 'Type inference' },
          { label: 'Generics' },
          { label: 'Union & intersection types' },
        ],
      },
      {
        id: 'runtime',
        title: 'Runtime & execution',
        blurb: 'Compile away types — what actually runs is still JavaScript.',
        items: [
          { label: 'Type erasure (mental model)' },
          { label: 'Transpilation & targets' },
          { label: 'Source maps & debugging' },
        ],
      },
      {
        id: 'concurrency',
        title: 'Concurrency model',
        blurb: 'Same async story as JS — TS adds types to promises and async flows.',
        items: [
          { label: 'Promise typing' },
          { label: 'async / await contracts' },
          { label: 'Event loop (inherits JS)' },
        ],
      },
      {
        id: 'data',
        title: 'Data & memory',
        blurb: 'Where types help and where they disappear at runtime.',
        items: [
          { label: 'Strict null checks' },
          { label: 'Readonly & immutability patterns' },
          { label: 'Enums vs union literals' },
        ],
      },
      {
        id: 'ecosystem',
        title: 'Ecosystem & patterns',
        blurb: 'Tooling and typed stacks built on npm.',
        items: [
          { label: '@types & DefinitelyTyped' },
          { label: 'Node + TypeScript services' },
          { label: 'Typed React / component props' },
        ],
      },
      {
        id: 'gotchas',
        title: 'Gotchas & pitfalls',
        blurb: 'Where the type checker lies or gets in the way.',
        items: [
          { label: 'any & type assertions' },
          { label: 'Nominal vs structural surprises' },
          { label: 'Overly complex types' },
        ],
      },
    ],
  },
  {
    id: 'python',
    title: 'Python',
    blurb: 'A flexible, high-level language optimized for productivity and data.',
    categories: [
      {
        id: 'core',
        title: 'Core concepts',
        blurb: 'Typing philosophy and idiomatic data shaping.',
        items: [
          { label: 'Dynamic typing' },
          { label: 'Duck typing' },
          { label: 'First-class functions' },
          { label: 'List / dict comprehensions' },
        ],
      },
      {
        id: 'runtime',
        title: 'Runtime & execution',
        blurb: 'How Python runs — interpreter, bytecode, and the CPython view.',
        items: [
          { label: 'Interpreted vs compiled' },
          { label: 'Python execution model' },
        ],
      },
      {
        id: 'concurrency',
        title: 'Concurrency model',
        blurb: 'Threads, processes, and async — and how the GIL shapes choices.',
        items: [
          { label: 'Threads vs multiprocessing' },
          { label: 'GIL (Global Interpreter Lock)' },
          { label: 'Asyncio' },
        ],
      },
      {
        id: 'data',
        title: 'Data & memory',
        blurb: 'Mutability and CPython memory basics.',
        items: [
          { label: 'Mutable vs immutable types' },
          { label: 'Reference counting' },
          { label: 'Memory management' },
        ],
      },
      {
        id: 'ecosystem',
        title: 'Ecosystem & patterns',
        blurb: 'Libraries and roles Python dominates.',
        items: [
          { label: 'Data libraries (pandas, NumPy)' },
          { label: 'Web APIs (FastAPI)' },
          { label: 'Scripting & automation' },
        ],
      },
      {
        id: 'gotchas',
        title: 'Gotchas & pitfalls',
        blurb: 'Subtle footguns in real codebases.',
        items: [
          { label: 'Mutable default arguments' },
          { label: 'Hidden performance issues' },
        ],
      },
    ],
  },
  {
    id: 'go',
    title: 'Go',
    blurb: 'A simple, fast language designed for concurrency and backend systems.',
    categories: [
      {
        id: 'core',
        title: 'Core concepts',
        blurb: 'Types, interfaces, and explicit errors — overlaps Design Patterns less, Concurrency more.',
        items: [
          { label: 'Structs & interfaces' },
          { label: 'Composition over inheritance' },
          { label: 'Error handling (no exceptions)' },
        ],
      },
      {
        id: 'runtime',
        title: 'Runtime & execution',
        blurb: 'Compile-fast, static binary, small runtime — compare to Rust and Python.',
        items: [
          { label: 'Go compiler' },
          { label: 'Go runtime' },
          { label: 'Garbage collection' },
        ],
      },
      {
        id: 'concurrency',
        title: 'Concurrency model',
        blurb: 'First-class goroutines — full Concurrency track expands patterns; here is the language view.',
        items: [
          { label: 'Goroutines' },
          { label: 'Channels' },
          { label: 'Select statement' },
          { label: 'Worker pools' },
        ],
      },
      {
        id: 'data',
        title: 'Data & memory',
        blurb: 'Pointers without pointer arithmetic — links to Low-Level Systems for the C picture.',
        items: [
          { label: 'Pointers in Go' },
          { label: 'Stack vs heap' },
          { label: 'Escape analysis' },
        ],
      },
      {
        id: 'ecosystem',
        title: 'Ecosystem & patterns',
        blurb: 'Batteries-included backend and tooling culture.',
        items: [
          { label: 'Standard library (net/http)' },
          { label: 'Microservices' },
          { label: 'CLI tools' },
        ],
      },
      {
        id: 'gotchas',
        title: 'Gotchas & pitfalls',
        blurb: 'Nil, leaks, and races in production Go.',
        items: [
          { label: 'Nil interfaces' },
          { label: 'Goroutine leaks' },
          { label: 'Concurrency bugs' },
        ],
      },
    ],
  },
  {
    id: 'rust',
    title: 'Rust',
    blurb: 'A systems language focused on safety, performance, and memory control.',
    categories: [
      {
        id: 'core',
        title: 'Core concepts',
        blurb: 'The borrow checker worldview — complements Low-Level Systems (manual C) with enforced rules.',
        items: [
          { label: 'Ownership' },
          { label: 'Borrowing' },
          { label: 'Lifetimes' },
        ],
      },
      {
        id: 'runtime',
        title: 'Runtime & execution',
        blurb: 'Ahead-of-time compilation and predictable performance.',
        items: [
          { label: 'Compilation model' },
          { label: 'Zero-cost abstractions' },
        ],
      },
      {
        id: 'concurrency',
        title: 'Concurrency model',
        blurb: 'Threads plus type-system help for safe sharing.',
        items: [
          { label: 'Fearless concurrency' },
          { label: 'Send & Sync traits' },
          { label: 'Threads' },
        ],
      },
      {
        id: 'data',
        title: 'Data & memory',
        blurb: 'No GC — memory rules are in the type system.',
        items: [
          { label: 'Stack vs heap' },
          { label: 'No garbage collector' },
          { label: 'Memory safety' },
        ],
      },
      {
        id: 'ecosystem',
        title: 'Ecosystem & patterns',
        blurb: 'Cargo, crates.io, and CLI-first workflows.',
        items: [
          { label: 'Cargo' },
          { label: 'Crates' },
          { label: 'CLI tools' },
        ],
      },
      {
        id: 'gotchas',
        title: 'Gotchas & pitfalls',
        blurb: 'What learners hit before fluency.',
        items: [
          { label: 'Borrow checker frustration' },
          { label: 'Lifetimes complexity' },
          { label: 'Compilation errors' },
        ],
      },
    ],
  },
  {
    id: 'c',
    title: 'C',
    blurb: 'The thin layer over the machine — pointers, UB, and manual lifetime discipline.',
    categories: [
      {
        id: 'core',
        title: 'Core concepts',
        blurb: 'What the language actually guarantees (and what it does not).',
        items: [
          { label: 'Pointers & addresses' },
          { label: 'Undefined behavior' },
          { label: 'Translation units & linkage' },
          { label: 'The preprocessor (mental model)' },
        ],
      },
      {
        id: 'runtime',
        title: 'Runtime & execution',
        blurb: 'Mostly compile-time — execution is your code plus libc/OS.',
        items: [
          { label: 'Compilation & object files' },
          { label: 'ABI & calling conventions' },
          { label: 'Stack frames' },
        ],
      },
      {
        id: 'concurrency',
        title: 'Concurrency model',
        blurb: 'No built-in model — threads and atomics come from the platform.',
        items: [
          { label: 'POSIX threads (pthreads)' },
          { label: 'Shared memory & data races' },
          { label: 'Atomics & memory order (C11)' },
        ],
      },
      {
        id: 'data',
        title: 'Data & memory',
        blurb: 'Layout, lifetime, and who frees what.',
        items: [
          { label: 'Stack vs heap (malloc/free)' },
          { label: 'Structs, arrays, & alignment' },
          { label: 'Strings & buffers' },
        ],
      },
      {
        id: 'ecosystem',
        title: 'Ecosystem & patterns',
        blurb: 'Where C still wins — kernels, embedded, and FFI boundaries.',
        items: [
          { label: 'libc & POSIX' },
          { label: 'Embedded & firmware' },
          { label: 'FFI lingua franca' },
        ],
      },
      {
        id: 'gotchas',
        title: 'Gotchas & pitfalls',
        blurb: 'Security and correctness failures that dominate C headlines.',
        items: [
          { label: 'Buffer overflows' },
          { label: 'Use-after-free & double-free' },
          { label: 'Integer overflow & conversions' },
        ],
      },
    ],
  },
  {
    id: 'cpp',
    title: 'C++',
    blurb: 'C with abstractions — RAII, templates, and a language that spans embedded to HPC.',
    categories: [
      {
        id: 'core',
        title: 'Core concepts',
        blurb: 'Object model plus compile-time computation.',
        items: [
          { label: 'Classes & RAII' },
          { label: 'Templates & generic code' },
          { label: 'Move semantics' },
          { label: 'Value categories (lvalue / rvalue)' },
        ],
      },
      {
        id: 'runtime',
        title: 'Runtime & execution',
        blurb: 'Zero-overhead ideals vs exceptions and RTTI.',
        items: [
          { label: 'Compilation model' },
          { label: 'Exceptions (when they cost)' },
          { label: 'Name mangling & linking' },
        ],
      },
      {
        id: 'concurrency',
        title: 'Concurrency model',
        blurb: 'Threads plus a precise memory model in the standard.',
        items: [
          { label: 'std::thread & futures' },
          { label: 'Mutexes & condition variables' },
          { label: 'Atomics & memory order' },
        ],
      },
      {
        id: 'data',
        title: 'Data & memory',
        blurb: 'Smart pointers and manual control in one language.',
        items: [
          { label: 'Stack vs heap' },
          { label: 'Smart pointers (unique / shared)' },
          { label: 'STL containers & iterators' },
        ],
      },
      {
        id: 'ecosystem',
        title: 'Ecosystem & patterns',
        blurb: 'Games, systems, and performance-critical libraries.',
        items: [
          { label: 'STL & Boost mindset' },
          { label: 'Game engines & real-time' },
          { label: 'Interfacing with C APIs' },
        ],
      },
      {
        id: 'gotchas',
        title: 'Gotchas & pitfalls',
        blurb: 'Complexity tax and subtle lifetime bugs.',
        items: [
          { label: 'Rule of zero / three / five' },
          { label: 'Iterator invalidation' },
          { label: 'ODR & ABI pitfalls' },
        ],
      },
    ],
  },
  {
    id: 'java',
    title: 'Java',
    blurb: 'Portable bytecode on the JVM — GC, threads, and a huge enterprise footprint.',
    categories: [
      {
        id: 'core',
        title: 'Core concepts',
        blurb: 'OOP on the JVM with interfaces and packages.',
        items: [
          { label: 'Classes & interfaces' },
          { label: 'Packages & visibility' },
          { label: 'Exceptions (checked vs unchecked)' },
        ],
      },
      {
        id: 'runtime',
        title: 'Runtime & execution',
        blurb: 'Class loading, JIT, and automatic memory management.',
        items: [
          { label: 'JVM & bytecode' },
          { label: 'Class loading' },
          { label: 'JIT compilation' },
          { label: 'Garbage collection' },
        ],
      },
      {
        id: 'concurrency',
        title: 'Concurrency model',
        blurb: 'Threads first — higher-level utilities in java.util.concurrent.',
        items: [
          { label: 'Threads & Runnable' },
          { label: 'synchronized & monitors' },
          { label: 'java.util.concurrent' },
        ],
      },
      {
        id: 'data',
        title: 'Data & memory',
        blurb: 'References, primitives, and heap object layout (conceptually).',
        items: [
          { label: 'Reference types vs primitives' },
          { label: 'Heap-allocated objects' },
          { label: 'Strings & immutability' },
        ],
      },
      {
        id: 'ecosystem',
        title: 'Ecosystem & patterns',
        blurb: 'Enterprise backends, Android (Kotlin today), and build tooling.',
        items: [
          { label: 'Spring & Jakarta EE' },
          { label: 'Maven & Gradle' },
          { label: 'JVM as a platform' },
        ],
      },
      {
        id: 'gotchas',
        title: 'Gotchas & pitfalls',
        blurb: 'Nulls, equality, and erased generics.',
        items: [
          { label: 'NullPointerException' },
          { label: 'equals & hashCode contracts' },
          { label: 'Generics type erasure' },
        ],
      },
    ],
  },
  {
    id: 'csharp',
    title: 'C#',
    blurb: 'Modern managed code on .NET — async-first ergonomics and a rich standard library.',
    categories: [
      {
        id: 'core',
        title: 'Core concepts',
        blurb: 'CLR types, properties, and language features that compile to IL.',
        items: [
          { label: 'Value vs reference types' },
          { label: 'Properties & methods' },
          { label: 'LINQ (mental model)' },
        ],
      },
      {
        id: 'runtime',
        title: 'Runtime & execution',
        blurb: 'JIT, GC, and the .NET runtime hosting your assemblies.',
        items: [
          { label: 'CLR & IL' },
          { label: 'JIT compilation' },
          { label: 'Garbage collection' },
        ],
      },
      {
        id: 'concurrency',
        title: 'Concurrency model',
        blurb: 'Task-based async mapped onto a thread pool.',
        items: [
          { label: 'async / await' },
          { label: 'Task & Task<T>' },
          { label: 'Thread pool & Parallel' },
        ],
      },
      {
        id: 'data',
        title: 'Data & memory',
        blurb: 'Structs on the stack, classes on the heap — plus modern span APIs.',
        items: [
          { label: 'struct vs class' },
          { label: 'Nullable reference types' },
          { label: 'Span<T> & Memory<T>' },
        ],
      },
      {
        id: 'ecosystem',
        title: 'Ecosystem & patterns',
        blurb: 'ASP.NET, desktop, games, and cloud-native .NET.',
        items: [
          { label: '.NET & NuGet' },
          { label: 'ASP.NET Core' },
          { label: 'Unity & game scripting' },
        ],
      },
      {
        id: 'gotchas',
        title: 'Gotchas & pitfalls',
        blurb: 'Async and nullability mistakes in production.',
        items: [
          { label: 'async void' },
          { label: 'ConfigureAwait & context' },
          { label: 'LINQ deferred execution' },
        ],
      },
    ],
  },
  {
    id: 'sql',
    title: 'SQL',
    blurb: 'Declarative queries over relational data — planners, transactions, and NULL semantics.',
    categories: [
      {
        id: 'core',
        title: 'Core concepts',
        blurb: 'Sets, keys, and the relational idea behind every dialect.',
        items: [
          { label: 'Tables, rows & keys' },
          { label: 'JOIN types (mental model)' },
          { label: 'ACID & transactions (overview)' },
        ],
      },
      {
        id: 'runtime',
        title: 'Runtime & execution',
        blurb: 'How a database turns SQL into work — not “interpreted” like Python.',
        items: [
          { label: 'Query planner & optimizer' },
          { label: 'Indexes & seek vs scan' },
          { label: 'Execution plans' },
        ],
      },
      {
        id: 'concurrency',
        title: 'Concurrency model',
        blurb: 'Isolation and locking — concurrency through the database, not app threads.',
        items: [
          { label: 'Isolation levels' },
          { label: 'Locks & deadlocks' },
          { label: 'MVCC (conceptual)' },
        ],
      },
      {
        id: 'data',
        title: 'Data & memory',
        blurb: 'Modeling, integrity, and the weirdness of NULL.',
        items: [
          { label: 'Normalization tradeoffs' },
          { label: 'Constraints & integrity' },
          { label: 'NULL semantics' },
        ],
      },
      {
        id: 'ecosystem',
        title: 'Ecosystem & patterns',
        blurb: 'Dialects, ORMs, and how apps talk to databases.',
        items: [
          { label: 'PostgreSQL vs SQL Server flavors' },
          { label: 'ORMs & query builders' },
          { label: 'Migrations & schema evolution' },
        ],
      },
      {
        id: 'gotchas',
        title: 'Gotchas & pitfalls',
        blurb: 'Performance and correctness traps in real services.',
        items: [
          { label: 'N+1 query problem' },
          { label: 'Implicit type coercion' },
          { label: 'SQL injection (see Security)' },
        ],
      },
    ],
  },
]

export const PROGRAMMING_LANGUAGES_DEFAULT_OPEN = [] as const
