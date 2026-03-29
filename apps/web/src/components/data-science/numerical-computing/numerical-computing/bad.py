"""
Contrast: naive Python patterns — fine for tiny n, wrong tool for numeric work.

Prefer ndarray factories and vectorized ops in ``present.py``.
"""

from __future__ import annotations


def make_ones_bad(n: int) -> list[float]:
    """Simulate 'ones' with repeated append — lots of Python overhead vs np.ones."""
    out: list[float] = []
    for _ in range(max(0, n)):
        out.append(1.0)
    return out


def stats_bad(values: list[float]) -> tuple[float, float]:
    """Manual sum/mean — reimplements what ``ndarray.sum`` / ``mean`` do in C."""
    if not values:
        return 0.0, 0.0
    total = 0.0
    for x in values:
        total += x
    return total, total / len(values)
