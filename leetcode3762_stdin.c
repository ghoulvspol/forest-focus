/*
 * 3762. Minimum Operations to Equalize Subarrays
 * Sparse Table + Persistent Segment Tree
 * Standard I/O version
 */

#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <stdbool.h>

#define MAXN 40005
#define MAXLOG 16
#define MAXNODES 750005

static int stMin[MAXLOG][MAXN], stMax[MAXLOG][MAXN];
static int rem_arr[MAXN];
static long long a[MAXN], comp[MAXN];
static int comp_size;

static int tL[MAXNODES], tR[MAXNODES], tCnt[MAXNODES];
static long long tSum[MAXNODES];
static int node_cnt;
static int root[MAXN];

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

static void pst_insert(int prev, int *cur, int lo, int hi, int pos, long long val) {
    int path[20], dir[20], sz = 0;
    int p = prev;
    while (lo < hi) {
        int nd = ++node_cnt;
        tL[nd] = tL[p]; tR[nd] = tR[p];
        tCnt[nd] = tCnt[p] + 1; tSum[nd] = tSum[p] + val;
        path[sz] = nd;
        int mid = (lo + hi) >> 1;
        if (pos <= mid) { dir[sz] = 0; p = tL[p]; hi = mid; }
        else { dir[sz] = 1; p = tR[p]; lo = mid + 1; }
        sz++;
    }
    {
        int nd = ++node_cnt;
        tL[nd] = tL[p]; tR[nd] = tR[p];
        tCnt[nd] = tCnt[p] + 1; tSum[nd] = tSum[p] + val;
        path[sz++] = nd;
    }
    for (int j = sz - 2; j >= 0; j--) {
        if (dir[j] == 0) tL[path[j]] = path[j + 1];
        else             tR[path[j]] = path[j + 1];
    }
    *cur = path[0];
}

static int lower_bound_comp(long long val) {
    int lo = 0, hi = comp_size - 1;
    while (lo < hi) {
        int mid = (lo + hi) >> 1;
        if (comp[mid] >= val) hi = mid;
        else lo = mid + 1;
    }
    return lo;
}

static int pst_kth(int u, int v, int k, int lo, int hi) {
    while (lo < hi) {
        int mid = (lo + hi) >> 1;
        int cntL = tCnt[tL[v]] - tCnt[tL[u]];
        if (k <= cntL) { u = tL[u]; v = tL[v]; hi = mid; }
        else { k -= cntL; u = tR[u]; v = tR[v]; lo = mid + 1; }
    }
    return lo;
}

static long long pst_sum_le(int u, int v, int pos, int lo, int hi) {
    if (pos < 0) return 0;
    long long res = 0;
    while (lo < hi) {
        int mid = (lo + hi) >> 1;
        if (pos <= mid) { u = tL[u]; v = tL[v]; hi = mid; }
        else { res += tSum[tL[v]] - tSum[tL[u]]; u = tR[u]; v = tR[v]; lo = mid + 1; }
    }
    return res + (tSum[v] - tSum[u]);
}

static int pst_cnt_le(int u, int v, int pos, int lo, int hi) {
    if (pos < 0) return 0;
    int res = 0;
    while (lo < hi) {
        int mid = (lo + hi) >> 1;
        if (pos <= mid) { u = tL[u]; v = tL[v]; hi = mid; }
        else { res += tCnt[tL[v]] - tCnt[tL[u]]; u = tR[u]; v = tR[v]; lo = mid + 1; }
    }
    return res + (tCnt[v] - tCnt[u]);
}

static int cmp_ll(const void *a, const void *b) {
    long long va = *(const long long *)a, vb = *(const long long *)b;
    return va < vb ? -1 : va > vb ? 1 : 0;
}

static void solve() {
    int n, q, k;
    while (scanf("%d %d %d", &n, &q, &k) == 3) {
        for (int i = 0; i < n; i++) scanf("%d", &rem_arr[i]);

        /* Compute remainders and quotients */
        for (int i = 0; i < n; i++) {
            a[i] = (long long)rem_arr[i] / k;
            rem_arr[i] = rem_arr[i] % k;
        }

        /* Coordinate compression */
        comp_size = 0;
        for (int i = 0; i < n; i++) comp[comp_size++] = a[i];
        qsort(comp, comp_size, sizeof(long long), cmp_ll);
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
        int first = 1;
        for (int qi = 0; qi < q; qi++) {
            int l, r;
            scanf("%d %d", &l, &r);
            int len = r - l + 1;

            /* Check feasibility */
            int j = 31 - __builtin_clz(len);
            int mn = stMin[j][l] < stMin[j][r - (1 << j) + 1] ? stMin[j][l] : stMin[j][r - (1 << j) + 1];
            int mx = stMax[j][l] > stMax[j][r - (1 << j) + 1] ? stMax[j][l] : stMax[j][r - (1 << j) + 1];

            if (mn != mx) {
                if (!first) putchar(' ');
                printf("-1");
                first = 0;
                continue;
            }

            /* Find median */
            int m = (len + 1) / 2;
            int idx = pst_kth(root[l], root[r + 1], m, 0, comp_size - 1);
            long long median = comp[idx];

            /* Compute cost */
            long long sumLow = pst_sum_le(root[l], root[r + 1], idx - 1, 0, comp_size - 1);
            long long sumAll = tSum[root[r + 1]] - tSum[root[l]];
            long long cntLow = pst_cnt_le(root[l], root[r + 1], idx - 1, 0, comp_size - 1);
            long long cntMed = pst_cnt_le(root[l], root[r + 1], idx, 0, comp_size - 1) - cntLow;
            long long sumHigh = sumAll - sumLow - median * cntMed;
            long long cntHigh = len - cntLow - cntMed;
            long long cost = median * cntLow - sumLow + sumHigh - median * cntHigh;

            if (!first) putchar(' ');
            printf("%lld", cost);
            first = 0;
        }
        putchar('\n');
    }
}

int main() {
    solve();
    return 0;
}
