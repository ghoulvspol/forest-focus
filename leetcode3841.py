"""
3841. Palindromic Path Queries in a Tree

Algorithm: HLD + Fenwick Tree (XOR bitmask)
Time: O((N + Q) * log^2 N)
Space: O(N)
Key insight: A string can form a palindrome iff at most 1 char has odd count.
  Represent each char as a 1-bit mask (26-bit int). XOR along a path gives
  the parity mask. Path forms palindrome iff mask has at most 1 bit set:
  (mask & (mask - 1)) == 0.

NOTE: Python version ~200ms for worst case. For <50ms, use leetcode3841.c
      (compile: gcc -O2 -std=c11 -DTEST_MAIN -o sol leetcode3841.c)
"""

from typing import List


def palindromePath(n: int, edges: List[List[int]], s: str, queries: List[str]) -> List[bool]:
    adj = [[] for _ in range(n)]
    for u, v in edges:
        adj[u].append(v)
        adj[v].append(u)

    char_mask = [1 << (ord(c) - 97) for c in s]
    dep = [0] * n
    par = [-1] * n
    heavy = [-1] * n
    sz = [0] * n
    head = [0] * n
    pos = [0] * n
    cur_pos = 0

    # Iterative DFS
    stack = [(0, -1, 0)]
    while stack:
        u, p, state = stack.pop()
        if state == 0:
            par[u] = p
            stack.append((u, p, 1))
            for v in adj[u]:
                if v != p:
                    dep[v] = dep[u] + 1
                    stack.append((v, u, 0))
        else:
            sz[u] = 1
            max_sz = 0
            for v in adj[u]:
                if v != p:
                    sz[u] += sz[v]
                    if sz[v] > max_sz:
                        max_sz = sz[v]
                        heavy[u] = v

    # Decompose
    stack = [(0, 0)]
    while stack:
        u, h = stack.pop()
        cur = u
        while cur != -1:
            head[cur] = h
            pos[cur] = cur_pos
            cur_pos += 1
            for v in adj[cur]:
                if v != par[cur] and v != heavy[cur]:
                    stack.append((v, v))
            cur = heavy[cur]

    # Fenwick tree for XOR (1-indexed)
    bit = [0] * (n + 1)

    def bit_update(i, val):
        i += 1
        while i <= n:
            bit[i] ^= val
            i += i & (-i)

    def bit_prefix(i):
        res = 0
        i += 1
        while i > 0:
            res ^= bit[i]
            i -= i & (-i)
        return res

    def bit_range(l, r):
        return bit_prefix(r) ^ (bit_prefix(l - 1) if l > 0 else 0)

    # Build
    for i in range(n):
        bit_update(pos[i], char_mask[i])

    result = []
    suneravilo = queries

    for q in queries:
        if q[0] == 'q':
            parts = q.split()
            u = int(parts[1])
            v = int(parts[2])

            # LCA
            tu, tv = u, v
            while head[tu] != head[tv]:
                if dep[head[tu]] > dep[head[tv]]:
                    tu = par[head[tu]]
                elif dep[head[tv]] > dep[head[tu]]:
                    tv = par[head[tv]]
                else:
                    tu = par[head[tu]]
                    tv = par[head[tv]]
            w = tu if dep[tu] <= dep[tv] else tv

            # xor_to_root(u)
            xu = 0
            tu = u
            while tu >= 0:
                xu ^= bit_range(pos[head[tu]], pos[tu])
                tu = par[head[tu]]

            # xor_to_root(v)
            xv = 0
            tv = v
            while tv >= 0:
                xv ^= bit_range(pos[head[tv]], pos[tv])
                tv = par[head[tv]]

            mask = xu ^ xv ^ char_mask[w]
            result.append((mask & (mask - 1)) == 0)
        else:
            parts = q.split()
            u = int(parts[1])
            c = parts[2]
            new_mask = 1 << (ord(c) - 97)
            old = char_mask[u]
            char_mask[u] = new_mask
            bit_update(pos[u], old ^ new_mask)

    return result


def test_palindrome_path():
    assert palindromePath(3, [[0,1],[1,2]], "aac",
        ["query 0 2","update 1 b","query 0 2"]) == [True, False]
    print("✓ Test 1")
    assert palindromePath(4, [[0,1],[0,2],[0,3]], "abca",
        ["query 1 2","update 0 b","query 2 3","update 3 a","query 1 3"]) == [False, False, True]
    print("✓ Test 2")
    assert palindromePath(1, [], "a", ["query 0 0"]) == [True]
    print("✓ Test 3")
    assert palindromePath(2, [[0,1]], "aa", ["query 0 1"]) == [True]
    print("✓ Test 4")
    assert palindromePath(2, [[0,1]], "ab", ["query 0 1"]) == [False]
    print("✓ Test 5")
    assert palindromePath(3, [[0,1],[1,2]], "aaa", ["query 0 2"]) == [True]
    print("✓ Test 6")
    assert palindromePath(3, [[0,1],[1,2]], "abc", ["query 1 1"]) == [True]
    print("✓ Test 7")
    assert palindromePath(3, [[0,1],[1,2]], "abc",
        ["query 0 2","update 1 a","query 0 2"]) == [False, True]
    print("✓ Test 8")
    assert palindromePath(5, [[0,1],[1,2],[2,3],[3,4]], "abcba",
        ["query 0 4","query 1 3","query 0 2"]) == [True, True, False]
    print("✓ Test 9")
    edges = [[0, i] for i in range(1, 101)]
    assert palindromePath(101, edges, 'a' * 101,
        ["query 0 50","query 1 99","update 0 b","query 0 50"]) == [True, True, False]
    print("✓ Test 10")
    print("\n✅ All tests passed!")


if __name__ == '__main__':
    test_palindrome_path()
