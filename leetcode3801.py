"""
LeetCode 3801: Minimum Cost to Merge Sorted Lists
Algorithm: Bitmask DP
Time: O(N * 2^n + n * 3^(n-1))  N=total elements, n=number of lists
Space: O(N * 2^n)

Key insights:
1. Timsort (sorted(a+b)) exploits pre-sorted runs - 4x faster than manual merge
2. Combined dp+sz array reduces array lookups from 6 to 4 per transition
3. Only enumerate submasks containing lsb (halves transitions: 3^n/2)
4. Median of even-length array = arr[(len-1)//2] (left middle)

Test 1: [[1,3,5],[2,4],[6,7,8]] -> 18
Test 2: [[1,1,5],[1,4,7,8]] -> 10
Test 3: [[1],[3]] -> 4
"""
from typing import List


class Solution:
    def minCost(self, lists: List[List[int]]) -> int:
        n = len(lists)
        size = 1 << n

        # Phase 1: Precompute merged list, median, size for each mask
        merged = [None] * size
        med = [0] * size
        sz = [0] * size

        for mask in range(1, size):
            lsb = mask & (-mask)
            rest = mask ^ lsb
            if rest == 0:
                idx = mask.bit_length() - 1
                merged[mask] = lists[idx]
            else:
                # Timsort recognizes two sorted runs → O(a+b) merge in C
                merged[mask] = sorted(merged[lsb] + merged[rest])
            sz[mask] = len(merged[mask])
            med[mask] = merged[mask][(sz[mask] - 1) // 2]

        # Phase 2: DP with combined dp+sz array
        # combined[i] = dp[i] + sz[i] → saves 2 array lookups per transition
        INF = float('inf')
        dp = [INF] * size
        comb = [0] * size
        dp[0] = 0
        for i in range(n):
            dp[1 << i] = 0
            comb[1 << i] = sz[1 << i]

        for mask in range(3, size):
            if mask & (mask - 1) == 0:
                continue  # single-bit masks already 0
            lsb = mask & (-mask)
            s = (mask - 1) & mask
            best = INF
            while s:
                if s & lsb:  # only process submasks with lsb → each partition once
                    other = mask ^ s
                    cost = comb[s] + comb[other] + abs(med[s] - med[other])
                    if cost < best:
                        best = cost
                s = (s - 1) & mask
            dp[mask] = best
            comb[mask] = best + sz[mask]

        return dp[size - 1]


if __name__ == "__main__":
    sol = Solution()

    r1 = sol.minCost([[1, 3, 5], [2, 4], [6, 7, 8]])
    assert r1 == 18, f"Test 1 failed: got {r1}"
    print(f"Test 1 PASS: {r1}")

    r2 = sol.minCost([[1, 1, 5], [1, 4, 7, 8]])
    assert r2 == 10, f"Test 2 failed: got {r2}"
    print(f"Test 2 PASS: {r2}")

    r3 = sol.minCost([[1], [3]])
    assert r3 == 4, f"Test 3 failed: got {r3}"
    print(f"Test 3 PASS: {r3}")

    print(f"Test 4 (single): {sol.minCost([[5], [10]])}")
    print(f"Test 5 (identical): {sol.minCost([[1, 2], [1, 2], [1, 2]])}")
    print(f"Test 6 (extreme): {sol.minCost([[-10**9], [10**9]])}")

    import time
    big = [list(range(i * 100, (i + 1) * 100)) for i in range(12)]
    start = time.perf_counter()
    r_big = sol.minCost(big)
    elapsed = (time.perf_counter() - start) * 1000
    print(f"Perf (12x100): {r_big}, {elapsed:.2f}ms")

    import random
    random.seed(42)
    worst = [sorted(random.sample(range(-10**9, 10**9), min(500, 2000 // 12))) for _ in range(12)]
    start = time.perf_counter()
    r_worst = sol.minCost(worst)
    elapsed = (time.perf_counter() - start) * 1000
    print(f"Worst case: {r_worst}, {elapsed:.2f}ms")
