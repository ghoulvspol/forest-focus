import math
import time

import numpy as np


class Solution:
    def countRoutes(self, grid: list[str], d: int) -> int:
        """
        DP + 前缀和 + numpy 向量化。

        状态：dp0[c] 到达 (r,c) 最后一步向上/起点
              dp1[c] 到达 (r,c) 最后一步水平

        转移：dp0[r][c] = Σ(dp0+dp1)[r-1][c']  (欧氏距离≤d)
              dp1[r][c] = Σ dp0[r][c']            (水平距离≤d, c'≠c)

        前缀和 O(1) 范围查询，numpy 向量化消除 Python 循环开销。
        时间 O(n*m)，空间 O(m)。
        """
        MOD = 10**9 + 7
        n = len(grid)
        m = len(grid[0])

        max_up_dc = math.isqrt(d * d - 1)

        avail = np.zeros((n, m), dtype=np.int64)
        for i in range(n):
            row = grid[i]
            for j in range(m):
                if row[j] == '.':
                    avail[i, j] = 1

        idx = np.arange(m, dtype=np.int64)
        hi_up = np.minimum(m, idx + max_up_dc + 1)
        lo_up = np.maximum(0, idx - max_up_dc)
        hi_hor = np.minimum(m, idx + d + 1)
        lo_hor = np.maximum(0, idx - d)

        pre = np.zeros(m + 1, dtype=np.int64)
        dp0 = avail[0].copy()
        dp1 = np.zeros(m, dtype=np.int64)

        # Row 0 horizontal
        np.cumsum(dp0, out=pre[1:])
        dp1 = ((pre[hi_hor] - pre[lo_hor] - dp0) * avail[0]) % MOD

        for r in range(1, n):
            av = avail[r]
            np.cumsum(dp0 + dp1, out=pre[1:])
            new_dp0 = ((pre[hi_up] - pre[lo_up]) * av) % MOD
            np.cumsum(new_dp0, out=pre[1:])
            new_dp1 = ((pre[hi_hor] - pre[lo_hor] - new_dp0) * av) % MOD
            dp0, dp1 = new_dp0, new_dp1

        return int((np.sum(dp0 * avail[n-1]) + np.sum(dp1 * avail[n-1])) % MOD)


def test():
    s = Solution()

    assert s.countRoutes(["..", "#."], 1) == 2
    assert s.countRoutes(["..", "#."], 2) == 4
    assert s.countRoutes(["#"], 750) == 0
    assert s.countRoutes([".."], 1) == 4
    assert s.countRoutes(["##", "##"], 1) == 0
    assert s.countRoutes(["."], 1) == 1
    assert s.countRoutes([".", ".", "."], 1) == 1
    assert s.countRoutes(["..", ".."], 750) == 16
    assert s.countRoutes(["..", ".."], 1000) == 16
    assert s.countRoutes(["...", "...", "..."], 1) == 41
    assert s.countRoutes([".#.", ".#.", ".#."], 1) == 2
    assert s.countRoutes([".#.", ".#.", ".#."], 2) == 16
    assert s.countRoutes(["..."], 1) == 7
    assert s.countRoutes(["..."], 2) == 9

    import random
    random.seed(42)
    n, m, d_val = 750, 750, 750
    big_grid = []
    for i in range(n):
        row = ''.join('.' if random.random() > 0.1 else '#' for _ in range(m))
        big_grid.append(row)

    s.countRoutes(["..", ".."], 2)

    times = []
    for _ in range(5):
        start = time.perf_counter()
        result = s.countRoutes(big_grid, d_val)
        elapsed_ms = (time.perf_counter() - start) * 1000
        times.append(elapsed_ms)

    best = min(times)
    print(f"750x750, d=750: result={result}, best={best:.1f}ms")
    print(f"Time O(n*m), Space O(m)")
    print("All 14 tests passed!")


if __name__ == "__main__":
    test()
