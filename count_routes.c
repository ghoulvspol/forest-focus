/*
 * 3797. Count Routes to Climb a Rectangular Grid
 *
 * Algorithm: DP + Prefix Sums
 * - dp0[c]: paths arriving at (r,c) via vertical move or start
 * - dp1[c]: paths arriving at (r,c) via horizontal move
 * - Transition: dp0 from row above (vertical dist ≤ d), dp1 from same row (horizontal dist ≤ d)
 * - Prefix sums for O(1) range queries
 *
 * Time: O(n * m), Space: O(m)
 * Key insight: max horizontal column delta for vertical move = isqrt(d²-1),
 *              horizontal move column delta = d (must stay on same row).
 */

#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <math.h>

#define MOD 1000000007LL

int numberOfRoutes(char** grid, int gridSize, int d) {
    int n = gridSize;
    int m = strlen(grid[0]);

    /* max column delta for vertical (upward) move: isqrt(d*d - 1) */
    int max_up_dc = (int)sqrt((double)d * d - 1.0);
    if (max_up_dc > m - 1) max_up_dc = m - 1;

    /* Precompute availability */
    int *avail = (int *)calloc(n * m, sizeof(int));
    for (int i = 0; i < n; i++)
        for (int j = 0; j < m; j++)
            avail[i * m + j] = (grid[i][j] == '.');

    /* dp0, dp1 for current row */
    long long *dp0 = (long long *)calloc(m, sizeof(long long));
    long long *dp1 = (long long *)calloc(m, sizeof(long long));
    long long *pre = (long long *)calloc(m + 1, sizeof(long long));

    /* Row 0: base case */
    for (int c = 0; c < m; c++)
        dp0[c] = avail[c];

    /* Row 0 horizontal */
    for (int c = 0; c < m; c++)
        pre[c + 1] = (pre[c] + dp0[c]) % MOD;
    for (int c = 0; c < m; c++) {
        int lo = c - d; if (lo < 0) lo = 0;
        int hi = c + d; if (hi >= m) hi = m - 1;
        dp1[c] = ((pre[hi + 1] - pre[lo] - dp0[c]) % MOD + MOD) % MOD;
        dp1[c] = (dp1[c] * avail[c]) % MOD;
    }

    /* Process rows 1 to n-1 */
    long long *new_dp0 = (long long *)calloc(m, sizeof(long long));
    long long *new_dp1 = (long long *)calloc(m, sizeof(long long));

    for (int r = 1; r < n; r++) {
        int *av = &avail[r * m];
        int *av_prev = &avail[(r - 1) * m];

        /* Prefix sum of (dp0 + dp1) from previous row */
        for (int c = 0; c < m; c++)
            pre[c + 1] = (pre[c] + dp0[c] + dp1[c]) % MOD;

        /* Vertical transitions */
        for (int c = 0; c < m; c++) {
            if (!av[c]) { new_dp0[c] = 0; continue; }
            int lo = c - max_up_dc; if (lo < 0) lo = 0;
            int hi = c + max_up_dc; if (hi >= m) hi = m - 1;
            new_dp0[c] = (pre[hi + 1] - pre[lo] + MOD) % MOD;
        }

        /* Prefix sum of new_dp0 (vertical arrivals only) */
        for (int c = 0; c < m; c++)
            pre[c + 1] = (pre[c] + new_dp0[c]) % MOD;

        /* Horizontal transitions */
        for (int c = 0; c < m; c++) {
            if (!av[c]) { new_dp1[c] = 0; continue; }
            int lo = c - d; if (lo < 0) lo = 0;
            int hi = c + d; if (hi >= m) hi = m - 1;
            new_dp1[c] = ((pre[hi + 1] - pre[lo] - new_dp0[c]) % MOD + MOD) % MOD;
            new_dp1[c] = (new_dp1[c] * av[c]) % MOD;
        }

        /* Swap */
        long long *tmp;
        tmp = dp0; dp0 = new_dp0; new_dp0 = tmp;
        tmp = dp1; dp1 = new_dp1; new_dp1 = tmp;
    }

    /* Sum dp0 + dp1 for bottom row available cells */
    long long ans = 0;
    int *av_bottom = &avail[(n - 1) * m];
    for (int c = 0; c < m; c++)
        if (av_bottom[c])
            ans = (ans + dp0[c] + dp1[c]) % MOD;

    free(avail); free(dp0); free(dp1); free(pre);
    free(new_dp0); free(new_dp1);
    return (int)ans;
}
