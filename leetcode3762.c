/*
 * 3762. Minimum Operations to Equalize Subarrays
 *
 * Algorithm: Sparse Table + Persistent Segment Tree
 * - Sparse Table: O(1) range min/max on remainders to check feasibility
 * - Persistent Segment Tree: O(log N) kth-smallest & prefix-sum queries
 *
 * Time: O(N log N + Q log N)
 * Space: O(N log N)
 *
 * Key insight: elements must share same (nums[i] % k). Optimal target
 * is median of floor(nums[i]/k). Cost = sum |a[i] - median|.
 */

#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <stdbool.h>

#define MAXN 40005
#define MAXLOG 16
#define MAXNODES 750005 /* ~N * 18 */

static int stMin[MAXLOG][MAXN], stMax[MAXLOG][MAXN];
static int rem_arr[MAXN];
static long long a[MAXN], comp[MAXN];
static int comp_size;

/* Persistent segment tree */
static int tL[MAXNODES], tR[MAXNODES], tCnt[MAXNODES];
static long long tSum[MAXNODES];
static int node_cnt;
static int root[MAXN];

/* Sparse table build */
static void build_st(int n) {
    int LOG = 0;
    while ((1 << LOG) <= n) LOG++;
    for (int i = 0; i < n; i++) stMin[0][i] = stMax[0][i] = rem_arr[i];
    for (int j = 1; j < LOG; j++)
        for (int i = 0; i + (1 << j) <= n; i++) {
            int half = 1 << (j - 1);
            stMin[j][i] = stMin[j-1][i] < stMin[j-1][i+half] ? stMin[j-1][i] : stMin[j-1][i+half];
            stMax[j][i] = stMax[j-1][i] > stMax[j-1][i+half] ? stMax[j-1][i] : stMax[j-1][i+half];
        }
}

/* Persistent segment tree: insert a value at position pos */
static void pst_insert(int prev, int *cur, int lo, int hi, int pos, long long val) {
    /* Create new node path from root to leaf */
    int path[20], dir[20], sz = 0;
    int p = prev;

    while (lo < hi) {
        int nd = ++node_cnt;
        tL[nd] = tL[p];
        tR[nd] = tR[p];
        tCnt[nd] = tCnt[p] + 1;
        tSum[nd] = tSum[p] + val;
        path[sz] = nd;

        int mid = (lo + hi) >> 1;
        if (pos <= mid) {
            dir[sz] = 0;
            p = tL[p];
            hi = mid;
        } else {
            dir[sz] = 1;
            p = tR[p];
            lo = mid + 1;
        }
        sz++;
    }

    /* Leaf node */
    {
        int nd = ++node_cnt;
        tL[nd] = tL[p];
        tR[nd] = tR[p];
        tCnt[nd] = tCnt[p] + 1;
        tSum[nd] = tSum[p] + val;
        path[sz++] = nd;
    }

    /* Fix child pointers bottom-up */
    for (int j = sz - 2; j >= 0; j--) {
        if (dir[j] == 0) tL[path[j]] = path[j + 1];
        else             tR[path[j]] = path[j + 1];
    }
    *cur = path[0];
}

/* Binary search in compressed array */
static int lower_bound_comp(long long val) {
    int lo = 0, hi = comp_size - 1;
    while (lo < hi) {
        int mid = (lo + hi) >> 1;
        if (comp[mid] >= val) hi = mid;
        else lo = mid + 1;
    }
    return lo;
}

/* Kth smallest in [l, r] using persistent segment tree */
static int pst_kth(int u, int v, int k, int lo, int hi) {
    while (lo < hi) {
        int mid = (lo + hi) >> 1;
        int cntL = tCnt[tL[v]] - tCnt[tL[u]];
        if (k <= cntL) {
            u = tL[u]; v = tL[v]; hi = mid;
        } else {
            k -= cntL; u = tR[u]; v = tR[v]; lo = mid + 1;
        }
    }
    return lo;
}

/* Sum of elements with compressed index <= pos in [l, r] */
static long long pst_sum_le(int u, int v, int pos, int lo, int hi) {
    if (pos < 0) return 0;
    long long res = 0;
    while (lo < hi) {
        int mid = (lo + hi) >> 1;
        if (pos <= mid) {
            u = tL[u]; v = tL[v]; hi = mid;
        } else {
            res += tSum[tL[v]] - tSum[tL[u]];
            u = tR[u]; v = tR[v]; lo = mid + 1;
        }
    }
    return res + (tSum[v] - tSum[u]);
}

/* Count of elements with compressed index <= pos in [l, r] */
static int pst_cnt_le(int u, int v, int pos, int lo, int hi) {
    if (pos < 0) return 0;
    int res = 0;
    while (lo < hi) {
        int mid = (lo + hi) >> 1;
        if (pos <= mid) {
            u = tL[u]; v = tL[v]; hi = mid;
        } else {
            res += tCnt[tL[v]] - tCnt[tL[u]];
            u = tR[u]; v = tR[v]; lo = mid + 1;
        }
    }
    return res + (tCnt[v] - tCnt[u]);
}

static int cmp_ll(const void *a, const void *b) {
    long long va = *(const long long *)a, vb = *(const long long *)b;
    return va < vb ? -1 : va > vb ? 1 : 0;
}

long long* minOperations(int* nums, int numsSize, int k, int** queries, int queriesSize, int* queriesColSize, int* returnSize) {
    int n = numsSize;

    /* Compute remainders and quotients */
    for (int i = 0; i < n; i++) {
        rem_arr[i] = nums[i] % k;
        a[i] = (long long)nums[i] / k;
    }

    /* Coordinate compression */
    comp_size = 0;
    for (int i = 0; i < n; i++) comp[comp_size++] = a[i];
    /* Sort */
    qsort(comp, comp_size, sizeof(long long), cmp_ll);
    /* Deduplicate */
    {
        int j = 0;
        for (int i = 1; i < comp_size; i++)
            if (comp[i] != comp[j]) comp[++j] = comp[i];
        comp_size = j + 1;
    }

    /* Build sparse table */
    build_st(n);

    /* Build persistent segment tree */
    node_cnt = 0;
    memset(tL, 0, sizeof(int) * MAXNODES);
    memset(tR, 0, sizeof(int) * MAXNODES);
    memset(tCnt, 0, sizeof(int) * MAXNODES);
    memset(tSum, 0, sizeof(long long) * MAXNODES);
    root[0] = 0;

    for (int i = 0; i < n; i++) {
        int pos = lower_bound_comp(a[i]);
        pst_insert(root[i], &root[i + 1], 0, comp_size - 1, pos, a[i]);
    }

    /* Process queries */
    long long *result = (long long *)malloc(sizeof(long long) * queriesSize);
    *returnSize = 0;

    for (int qi = 0; qi < queriesSize; qi++) {
        int l = queries[qi][0], r = queries[qi][1];
        int len = r - l + 1;

        /* Check if all remainders are equal using sparse table */
        int j = 31 - __builtin_clz(len);
        int mn = stMin[j][l] < stMin[j][r - (1 << j) + 1] ? stMin[j][l] : stMin[j][r - (1 << j) + 1];
        int mx = stMax[j][l] > stMax[j][r - (1 << j) + 1] ? stMax[j][l] : stMax[j][r - (1 << j) + 1];
        if (mn != mx) {
            result[(*returnSize)++] = -1;
            continue;
        }

        /* Find median of a[l..r] */
        int m = (len + 1) / 2;
        int idx = pst_kth(root[l], root[r + 1], m, 0, comp_size - 1);
        long long median = comp[idx];

        /* Compute cost: sum |a[i] - median| */
        long long sumLow = pst_sum_le(root[l], root[r + 1], idx - 1, 0, comp_size - 1);
        long long sumAll = tSum[root[r + 1]] - tSum[root[l]];
        long long cntLow = pst_cnt_le(root[l], root[r + 1], idx - 1, 0, comp_size - 1);
        long long cntMed = pst_cnt_le(root[l], root[r + 1], idx, 0, comp_size - 1) - cntLow;
        long long sumHigh = sumAll - sumLow - median * cntMed;
        long long cntHigh = len - cntLow - cntMed;
        result[(*returnSize)++] = median * cntLow - sumLow + sumHigh - median * cntHigh;
    }

    return result;
}
