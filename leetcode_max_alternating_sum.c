#include <stdio.h>
#include <string.h>

#define MAXN 100005
#define MAXV 100002

int nums[MAXN];
long long dp_up[MAXN], dp_down[MAXN];
long long tree_down[4 * MAXV], tree_up[4 * MAXV];
int seg_V;

static void seg_init(int n) {
    seg_V = n;
    memset(tree_down, 0, sizeof(tree_down));
    memset(tree_up,   0, sizeof(tree_up));
}

static void seg_upd(long long *tree, int p, int l, int r, int idx, long long val) {
    if (l == r) {
        if (val > tree[p]) tree[p] = val;
        return;
    }
    int mid = (l + r) >> 1;
    if (idx <= mid) seg_upd(tree, p << 1, l, mid, idx, val);
    else            seg_upd(tree, p << 1 | 1, mid + 1, r, idx, val);
    long long lv = tree[p << 1], rv = tree[p << 1 | 1];
    tree[p] = lv > rv ? lv : rv;
}

static long long seg_qry(long long *tree, int p, int l, int r, int ql, int qr) {
    if (ql > qr) return 0;
    if (ql <= l && r <= qr) return tree[p];
    int mid = (l + r) >> 1;
    long long res = 0;
    if (ql <= mid) {
        long long v = seg_qry(tree, p << 1, l, mid, ql, qr);
        if (v > res) res = v;
    }
    if (qr > mid) {
        long long v = seg_qry(tree, p << 1 | 1, mid + 1, r, ql, qr);
        if (v > res) res = v;
    }
    return res;
}

int solve() {
    int n, k;
    while (scanf("%d %d", &n, &k) != EOF) {
        int V = 0;
        for (int i = 0; i < n; i++) {
            scanf("%d", &nums[i]);
            if (nums[i] > V) V = nums[i];
        }

        seg_init(V);

        long long ans = 0;
        for (int i = 0; i < n; i++) {
            long long best_down = 0, best_up = 0;
            if (nums[i] > 1)
                best_down = seg_qry(tree_down, 1, 1, seg_V, 1, nums[i] - 1);
            if (nums[i] < V)
                best_up = seg_qry(tree_up, 1, 1, seg_V, nums[i] + 1, V);

            dp_up[i]   = best_down > 0 ? best_down + nums[i] : nums[i];
            dp_down[i] = best_up   > 0 ? best_up   + nums[i] : nums[i];

            long long cur = dp_up[i] > dp_down[i] ? dp_up[i] : dp_down[i];
            if (cur > ans) ans = cur;

            int j = i - k + 1;
            if (j >= 0) {
                seg_upd(tree_down, 1, 1, seg_V, nums[j], dp_down[j]);
                seg_upd(tree_up,   1, 1, seg_V, nums[j], dp_up[j]);
            }
        }
        printf("%lld\n", ans);
    }
    return 0;
}

int main() {
    solve();
    return 0;
}
