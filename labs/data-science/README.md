# Data science lab (authoring)

Published lesson **code** lives under `concepts/<slug>/` (same idea as design-patterns):

- **`concepts/numerical-computing/present.py`** — good NumPy patterns aligned with the simulator
- **`concepts/numerical-computing/bad.py`** — contrast / naive Python style
- **`concepts/numerical-computing/demo/main.py`** — runnable NumPy tour

Metadata and parameters: `services/api/internal/labs/data/data-science.json` (embed paths only; `make labs-sync` copies this tree into `services/api/internal/labs/embed/data-science/`).

Use **`sandbox/`** for scratch work. Full workflow: **`../CONCEPT.md`**.

## Install dependencies & run (Numerical Computing)

From the **concept** folder (paths are relative to that directory):

```bash
cd labs/data-science/concepts/numerical-computing

# Create a virtualenv (kept out of git — see repo-root .gitignore)
python3 -m venv .venv

# Activate it
source .venv/bin/activate          # macOS / Linux
# .venv\Scripts\activate         # Windows (cmd/PowerShell)

# Install pinned deps from requirements.txt
pip install -r requirements.txt

# Run the demo
python demo/main.py

# Or run the lesson modules directly
python present.py
python bad.py
```

One-liner without activating the venv (still uses `.venv`):

```bash
cd labs/data-science/concepts/numerical-computing
python3 -m venv .venv && .venv/bin/pip install -r requirements.txt && .venv/bin/python demo/main.py
```

On Windows, replace `.venv/bin/pip` with `.venv\Scripts\pip` and `.venv/bin/python` with `.venv\Scripts\python`.
