#!/usr/bin/env python3
"""
Runnable NumPy demo — pairs with ../present.py (TraceLab Numerical Computing).

  cd labs/data-science/concepts/numerical-computing/demo
  python3 main.py

Requires: pip install numpy
"""

from __future__ import annotations

import numpy as np


def main() -> None:
    n = 8
    demos: list[tuple[str, np.ndarray]] = [
        ("ones", np.ones(n)),
        ("zeros", np.zeros(n)),
        ("arange", np.arange(n, dtype=np.float64)),
        ("linspace", np.linspace(0.0, 1.0, n)),
    ]

    for name, arr in demos:
        print(f"\n{name}:")
        print(f"  shape={arr.shape} dtype={arr.dtype}")
        print(f"  values={arr}")
        print(
            f"  sum={arr.sum():.4f} mean={arr.mean():.4f} "
            f"min={arr.min():.4f} max={arr.max():.4f}"
        )

    m = np.array([[1.0, 2.0], [3.0, 4.0]])
    print("\n2×2 matrix @ identity:")
    print(m @ np.eye(2))


if __name__ == "__main__":
    main()
