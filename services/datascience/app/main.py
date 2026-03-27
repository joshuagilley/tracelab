"""
TraceLab Data Science playground — run locally or in Docker to experiment with NumPy.
Production UI uses static snapshots from the Go API; this service is optional there.
"""

import os

import numpy as np
from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="TraceLab Data Science", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health():
    return {"status": "ok", "service": "tracelab-datascience"}


@app.get("/api/playground/numpy-demo")
def numpy_demo(
    fn: str = Query("ones", description="ones | zeros | arange | linspace"),
    n: int = Query(8, ge=1, le=64),
):
    """Execute a tiny NumPy demo (local / dev only — not used by static prod UI)."""
    fn = fn.lower().strip()
    if fn == "ones":
        arr = np.ones(n, dtype=np.float64)
    elif fn == "zeros":
        arr = np.zeros(n, dtype=np.float64)
    elif fn == "arange":
        arr = np.arange(n, dtype=np.float64)
    elif fn == "linspace":
        arr = np.linspace(0.0, 1.0, n, dtype=np.float64)
    else:
        return {"error": f"unknown function: {fn}"}

    return {
        "function": fn,
        "shape": list(arr.shape),
        "dtype": str(arr.dtype),
        "sample": arr[: min(16, len(arr))].tolist(),
        "sum": float(arr.sum()),
        "mean": float(arr.mean()),
    }


@app.get("/api/info")
def info():
    return {
        "numpy_version": np.__version__,
        "mode": os.getenv("TRACELAB_MODE", "playground"),
    }
