/*
 * 3841. Palindromic Path Queries in a Tree
 * HLD + Fenwick Tree (XOR bitmask)
 * Standard I/O version
 */

#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <stdbool.h>

#define MAXN 50002
#define MAXE 100004

typedef struct { int to, next; } Edge;

static Edge edges_buf[MAXE];
static int head_adj[MAXN], ecnt;
static int dep[MAXN], par[MAXN], heavy[MAXN], sz[MAXN];
static int head[MAXN], pos[MAXN];
static int char_mask[MAXN];
static int bit[MAXN];
static int n_nodes;

static void add_edge(int u, int v) {
    edges_buf[ecnt] = (Edge){v, head_adj[u]};
    head_adj[u] = ecnt++;
    edges_buf[ecnt] = (Edge){u, head_adj[v]};
    head_adj[v] = ecnt++;
}

static inline void bit_update(int i, int val) {
    for (i++; i <= n_nodes; i += i & (-i))
        bit[i] ^= val;
}

static inline int bit_prefix(int i) {
    int res = 0;
    for (i++; i > 0; i -= i & (-i))
        res ^= bit[i];
    return res;
}

static inline int bit_range(int l, int r) {
    return bit_prefix(r) ^ (l > 0 ? bit_prefix(l - 1) : 0);
}

static void solve() {
    int n, q;
    while (scanf("%d %d", &n, &q) == 2) {
        /* Read edges */
        memset(head_adj, -1, sizeof(int) * n);
        ecnt = 0;
        for (int i = 0; i < n - 1; i++) {
            int u, v;
            scanf("%d %d", &u, &v);
            add_edge(u, v);
        }

        n_nodes = n;

        /* Read string */
        char s[MAXN];
        scanf("%s", s);

        /* DFS1: parent, depth, subtree size, heavy child */
        static int stack[MAXN * 3];
        int sp = 0;
        stack[sp++] = 0; stack[sp++] = -1; stack[sp++] = 0;

        while (sp > 0) {
            int state = stack[--sp];
            int p = stack[--sp];
            int u = stack[--sp];

            if (state == 0) {
                par[u] = p;
                stack[sp++] = u; stack[sp++] = p; stack[sp++] = 1;
                for (int e = head_adj[u]; e != -1; e = edges_buf[e].next) {
                    int v = edges_buf[e].to;
                    if (v != p) {
                        dep[v] = dep[u] + 1;
                        stack[sp++] = v; stack[sp++] = u; stack[sp++] = 0;
                    }
                }
            } else {
                sz[u] = 1;
                int max_sz = 0;
                heavy[u] = -1;
                for (int e = head_adj[u]; e != -1; e = edges_buf[e].next) {
                    int v = edges_buf[e].to;
                    if (v != p) {
                        sz[u] += sz[v];
                        if (sz[v] > max_sz) {
                            max_sz = sz[v];
                            heavy[u] = v;
                        }
                    }
                }
            }
        }

        /* DFS2: decompose into chains */
        int cur_pos = 0;
        sp = 0;
        stack[sp++] = 0; stack[sp++] = 0;

        while (sp > 0) {
            int h = stack[--sp];
            int u = stack[--sp];
            int cur = u;
            while (cur != -1) {
                head[cur] = h;
                pos[cur] = cur_pos++;
                for (int e = head_adj[cur]; e != -1; e = edges_buf[e].next) {
                    int v = edges_buf[e].to;
                    if (v != par[cur] && v != heavy[cur]) {
                        stack[sp++] = v; stack[sp++] = v;
                    }
                }
                cur = heavy[cur];
            }
        }

        /* Build Fenwick tree */
        memset(bit, 0, sizeof(int) * (n + 1));
        for (int i = 0; i < n; i++) {
            char_mask[i] = 1 << (s[i] - 'a');
            bit_update(pos[i], char_mask[i]);
        }

        /* Process queries, output T/F per query on one line */
        char op[16];
        char out[MAXN];
        int out_len = 0;
        for (int qi = 0; qi < q; qi++) {
            scanf("%s", op);
            if (op[0] == 'q') {
                int u, v;
                scanf("%d %d", &u, &v);

                /* LCA */
                int tu = u, tv = v;
                while (head[tu] != head[tv]) {
                    if (dep[head[tu]] > dep[head[tv]])
                        tu = par[head[tu]];
                    else if (dep[head[tv]] > dep[head[tu]])
                        tv = par[head[tv]];
                    else { tu = par[head[tu]]; tv = par[head[tv]]; }
                }
                int w = dep[tu] <= dep[tv] ? tu : tv;

                /* XOR from u to root */
                int xu = 0;
                tu = u;
                while (tu >= 0) {
                    xu ^= bit_range(pos[head[tu]], pos[tu]);
                    tu = par[head[tu]];
                }

                /* XOR from v to root */
                int xv = 0;
                tv = v;
                while (tv >= 0) {
                    xv ^= bit_range(pos[head[tv]], pos[tv]);
                    tv = par[head[tv]];
                }

                int mask = xu ^ xv ^ char_mask[w];
                out[out_len++] = (mask & (mask - 1)) == 0 ? 'T' : 'F';
            } else {
                int u; char c;
                scanf("%d %c", &u, &c);
                int new_mask = 1 << (c - 'a');
                int old = char_mask[u];
                char_mask[u] = new_mask;
                bit_update(pos[u], old ^ new_mask);
            }
        }
        out[out_len] = '\0';
        printf("%s\n", out);
    }
}

int main() {
    solve();
    return 0;
}
