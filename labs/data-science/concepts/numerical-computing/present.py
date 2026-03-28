"""
Good: NumPy vectorized array creation (TraceLab Numerical Computing lesson).

Pick a routine and length — the UI simulator mirrors this logic in the browser.
"""

from __future__ import annotations

import numpy as np


def make_array(fn_name: str, n: int) -> np.ndarray:
    """Create a 1-D array of length n using the named NumPy factory."""
    n = max(1, min(64, int(n)))
    if fn_name == "ones":
        return np.ones(n)
    if fn_name == "zeros":
        return np.zeros(n)
    if fn_name == "arange":
        return np.arange(n, dtype=np.float64)
    if fn_name == "linspace":
        return np.linspace(0.0, 1.0, n)
    return np.ones(n)


def summarize(a: np.ndarray) -> None:
    print("shape:", a.shape)
    print("dtype:", a.dtype)
    print("values:", a)
    print("sum:", float(a.sum()), "mean:", float(a.mean()))


if __name__ == "__main__":
    a = make_array("ones", 8)
    summarize(a)
