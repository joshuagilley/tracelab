# Labs manifest

`concepts.json` is the **source of truth** for which practice bundles CI must verify: each entry is a catalog concept id (`Concepts._id`) and one or more runnable **bundles** (language / sandbox tree).

When you add or change a concept that ships a downloadable practice ZIP from `sandbox/`, add or update its bundle here. Paths are relative to the `sandbox/` directory at the repo root.

Each bundle lists:

- **`type`**: `go` or `python` (how the reference file is applied before tests).
- **`sandboxPath`**: directory under `sandbox/` containing the files (the same tree you zip or upload to GCS for **`practice`**).
- **`referenceFile`** / **`starterFile`**: paths under that directory; the reference replaces the starter only for the test run (then the starter is restored).
- **`testCommand`**: argv split for `exec` (e.g. `["go", "test", "./..."]` or `["python3", "-m", "unittest", "test_main"]`). The process working directory is `sandbox/<sandboxPath>` unless you add **`workdir`** (relative to that same directory).

`go run ./cmd/lab-tester` in `services/api` reads this file; it does **not** scan the tree for filenames.
