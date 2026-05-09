/*
 * 3797. Count Routes to Climb a Rectangular Grid
 * DP + Prefix Sums, O(n*m) time, O(m) space
 */

#include <stdio.h>

#define MOD 1000000007LL
#define MAXM 755

long long dp0[MAXM], dp1[MAXM], pre[MAXM];
int avail[750][MAXM];
char buf[MAXM];

/* integer sqrt: largest x with x*x <= v */
static int isqrt(int v) {
    int x = 0;
    while ((x + 1) * (x + 1) <= v) x++;
    return x;
}

int solve() {
    int n, m, d;
    while (scanf("%d %d %d", &n, &m, &d) != EOF) {
        for (int i = 0; i < n; i++) {
            scanf("%s", buf);
            for (int j = 0; j < m; j++)
                avail[i][j] = (buf[j] == '.');
        }

        int max_up_dc = isqrt(d * d - 1);
        if (max_up_dc > m - 1) max_up_dc = m - 1;

        /* Row 0 */
        for (int c = 0; c < m; c++)
            dp0[c] = avail[0][c];
        for (int c = 0; c < m; c++)
            pre[c + 1] = (pre[c] + dp0[c]) % MOD;
        for (int c = 0; c < m; c++) {
            int lo = c - d; if (lo < 0) lo = 0;
            int hi = c + d; if (hi >= m) hi = m - 1;
            dp1[c] = ((pre[hi + 1] - pre[lo] - dp0[c]) % MOD + MOD) % MOD;
            dp1[c] = (dp1[c] * avail[0][c]) % MOD;
        }

        /* Rows 1 to n-1 */
        for (int r = 1; r < n; r++) {
            for (int c = 0; c < m; c++)
                pre[c + 1] = (pre[c] + dp0[c] + dp1[c]) % MOD;
            for (int c = 0; c < m; c++) {
                if (!avail[r][c]) { dp0[c] = 0; continue; }
                int lo = c - max_up_dc; if (lo < 0) lo = 0;
                int hi = c + max_up_dc; if (hi >= m) hi = m - 1;
                dp0[c] = (pre[hi + 1] - pre[lo] + MOD) % MOD;
            }
            for (int c = 0; c < m; c++)
                pre[c + 1] = (pre[c] + dp0[c]) % MOD;
            for (int c = 0; c < m; c++) {
                if (!avail[r][c]) { dp1[c] = 0; continue; }
                int lo = c - d; if (lo < 0) lo = 0;
                int hi = c + d; if (hi >= m) hi = m - 1;
                dp1[c] = ((pre[hi + 1] - pre[lo] - dp0[c]) % MOD + MOD) % MOD;
                dp1[c] = (dp1[c] * avail[r][c]) % MOD;
            }
        }

        long long ans = 0;
        for (int c = 0; c < m; c++)
            if (avail[n - 1][c])
                ans = (ans + dp0[c] + dp1[c]) % MOD;
        printf("%lld\n", ans);
    }
    return 0;
}

int main() {
    solve();
    return 0;
}
