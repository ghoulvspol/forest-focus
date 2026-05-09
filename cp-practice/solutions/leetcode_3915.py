"""
LeetCode 3915 - Maximum Sum of Alternating Subsequence with Distance at Least K

Algorithm: BIT (Binary Indexed Tree) optimized DP
Time: O(n * log(max_val)), where max_val = 10^5
Space: O(max_val) for two BITs + O(n) for dp storage
Key insight:
  dp[i][0] = max sum ending at i with UP move (nums[prev] < nums[i])
  dp[i][1] = max sum ending at i with DOWN move (nums[prev] > nums[i])
  Transitions:
    dp[i][0] = nums[i] + max(dp[j][1]) for j <= i-k, nums[j] < nums[i]
    dp[i][1] = nums[i] + max(dp[j][0]) for j <= i-k, nums[j] > nums[i]
  Use two BITs to query prefix/suffix max in O(log V).
  Deferred update: only add dp[j] to BIT when j <= i-k (valid predecessor).
  Uses array module for memory efficiency (~3MB vs ~14MB with lists).

Test: [5,4,2], k=2 -> 7
Test: [3,5,4,2,4], k=1 -> 14
Test: [5], k=1 -> 5
Test: [1,2], k=1 -> 3
Test: [1,2], k=2 -> 2
"""
from sys import stdin, stdout
from array import array

def main():
    data = stdin.buffer.read().split()
    idx = 0
    t = int(data[idx]); idx += 1
    out = []
    M = 100001

    for _ in range(t):
        n = int(data[idx]); idx += 1
        k = int(data[idx]); idx += 1

        # Use array for memory efficiency (8 bytes per element vs 28 for list)
        nums = array('q', (int(data[idx + j]) for j in range(n)))
        idx += n

        # BITs for prefix/suffix max queries (array for memory efficiency)
        b1 = array('q', [0]) * (M + 1)  # prefix max for dp[j][1]
        b0 = array('q', [0]) * (M + 1)  # suffix max for dp[j][0] (reversed index)
        da0 = array('q', [0]) * n
        da1 = array('q', [0]) * n
        ans = 0

        for i in range(n):
            v = nums[i]

            # Prefix max query on b1 for values < v
            s = 0; q = v - 1
            while q:
                bv = b1[q]
                if bv > s: s = bv
                q -= q & -q
            d0 = v + s

            # Prefix max query on b0 for values > v (reversed index)
            s = 0; q = M - v
            while q:
                bv = b0[q]
                if bv > s: s = bv
                q -= q & -q
            d1 = v + s

            da0[i] = d0
            da1[i] = d1
            if d0 > ans: ans = d0
            if d1 > ans: ans = d1

            # Deferred update: add position i-k+1
            if i >= k - 1:
                j = i - k + 1
                vj = nums[j]
                dd0 = da0[j]
                dd1 = da1[j]

                u = vj
                while u <= M:
                    if dd1 > b1[u]: b1[u] = dd1
                    u += u & -u

                u = M - vj + 1
                while u <= M:
                    if dd0 > b0[u]: b0[u] = dd0
                    u += u & -u

        out.append(str(ans))

    stdout.write("\n".join(out))

if __name__ == "__main__":
    main()
