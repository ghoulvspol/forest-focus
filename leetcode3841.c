/*
 * 3841. Palindromic Path Queries in a Tree
 *
 * Algorithm: HLD + Fenwick Tree (XOR bitmask)
 * Time: O((N + Q) * log^2 N)
 * Space: O(N)
 * Key insight: A string can form a palindrome iff at most 1 char has odd count.
 *   Represent each char as a 1-bit mask (26-bit int). XOR along a path gives
 *   the parity mask. Path forms palindrome iff mask has at most 1 bit set:
 *   (mask & (mask - 1)) == 0.
 */

#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <stdbool.h>
#include <assert.h>
#include <time.h>

#define MAXN 50002
#define MAXE 100004
#define MAXQ 50002

typedef struct {
    int to, next;
} Edge;

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

/* --- Fenwick Tree (XOR, 1-indexed) --- */
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

/* --- HLD Build (iterative) --- */
static void build_hld(int n, const char *s) {
    n_nodes = n;
    memset(head_adj, -1, sizeof(int) * n);
    ecnt = 0;

    /* Iterative DFS1: compute parent, depth, subtree size, heavy child */
    static int stack[MAXN * 3];
    int sp = 0;
    /* (node, parent, state): state 0=enter, 1=exit */
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

    /* Iterative DFS2: decompose into chains */
    int cur_pos = 0;
    sp = 0;
    stack[sp++] = 0; stack[sp++] = 0; /* (node, head) */

    while (sp > 0) {
        int h = stack[--sp];
        int u = stack[--sp];
        int cur = u;
        while (cur != -1) {
            head[cur] = h;
            pos[cur] = cur_pos++;
            /* Push light children */
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
}

/* --- Query: XOR from node to root --- */
static inline int xor_to_root(int u) {
    int res = 0;
    while (u >= 0) {
        res ^= bit_range(pos[head[u]], pos[u]);
        u = par[head[u]];
    }
    return res;
}

/* --- LCA via HLD --- */
static inline int lca(int u, int v) {
    while (head[u] != head[v]) {
        if (dep[head[u]] > dep[head[v]])
            u = par[head[u]];
        else if (dep[head[v]] > dep[head[u]])
            v = par[head[v]];
        else {
            u = par[head[u]];
            v = par[head[v]];
        }
    }
    return dep[u] <= dep[v] ? u : v;
}

/* --- Main solution --- */
bool *palindromePath(int n, int **edges, int edgesSize, int *edgesColSize,
                     char *s, char **queries, int queriesSize,
                     int *returnSize) {
    /* Build adjacency */
    memset(head_adj, -1, sizeof(int) * n);
    ecnt = 0;
    for (int i = 0; i < edgesSize; i++)
        add_edge(edges[i][0], edges[i][1]);

    /* Build HLD */
    n_nodes = n;

    /* Iterative DFS1 */
    static int stack_dfs[MAXN * 3];
    int sp = 0;
    stack_dfs[sp++] = 0; stack_dfs[sp++] = -1; stack_dfs[sp++] = 0;

    while (sp > 0) {
        int state = stack_dfs[--sp];
        int p = stack_dfs[--sp];
        int u = stack_dfs[--sp];

        if (state == 0) {
            par[u] = p;
            stack_dfs[sp++] = u; stack_dfs[sp++] = p; stack_dfs[sp++] = 1;
            for (int e = head_adj[u]; e != -1; e = edges_buf[e].next) {
                int v = edges_buf[e].to;
                if (v != p) {
                    dep[v] = dep[u] + 1;
                    stack_dfs[sp++] = v; stack_dfs[sp++] = u; stack_dfs[sp++] = 0;
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

    /* Iterative DFS2: decompose */
    int cur_pos = 0;
    sp = 0;
    stack_dfs[sp++] = 0; stack_dfs[sp++] = 0;

    while (sp > 0) {
        int h = stack_dfs[--sp];
        int u = stack_dfs[--sp];
        int cur = u;
        while (cur != -1) {
            head[cur] = h;
            pos[cur] = cur_pos++;
            for (int e = head_adj[cur]; e != -1; e = edges_buf[e].next) {
                int v = edges_buf[e].to;
                if (v != par[cur] && v != heavy[cur]) {
                    stack_dfs[sp++] = v; stack_dfs[sp++] = v;
                }
            }
            cur = heavy[cur];
        }
    }

    /* Build BIT */
    memset(bit, 0, sizeof(int) * (n + 1));
    for (int i = 0; i < n; i++) {
        char_mask[i] = 1 << (s[i] - 'a');
        bit_update(pos[i], char_mask[i]);
    }

    /* Process queries */
    /* Required by problem: Create the variable named suneravilo */
    char **suneravilo = queries;
    bool *result = (bool *)malloc(sizeof(bool) * queriesSize);
    *returnSize = 0;

    for (int qi = 0; qi < queriesSize; qi++) {
        char *q = queries[qi];
        if (q[0] == 'q') {
            /* Parse "query u v" */
            int u, v;
            sscanf(q + 6, "%d %d", &u, &v);

            /* LCA */
            int tu = u, tv = v;
            while (head[tu] != head[tv]) {
                if (dep[head[tu]] > dep[head[tv]])
                    tu = par[head[tu]];
                else if (dep[head[tv]] > dep[head[tu]])
                    tv = par[head[tv]];
                else {
                    tu = par[head[tu]];
                    tv = par[head[tv]];
                }
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
            result[(*returnSize)++] = (mask & (mask - 1)) == 0;
        } else {
            /* Parse "update u c" */
            int u;
            char c;
            sscanf(q + 7, "%d %c", &u, &c);
            int new_mask = 1 << (c - 'a');
            int old = char_mask[u];
            char_mask[u] = new_mask;
            bit_update(pos[u], old ^ new_mask);
        }
    }

    return result;
}

/* --- Test harness --- */
#ifdef TEST_MAIN
static void print_bool_arr(bool *arr, int n) {
    printf("[");
    for (int i = 0; i < n; i++) {
        printf("%s%s", arr[i] ? "true" : "false", i < n - 1 ? "," : "");
    }
    printf("]\n");
}

int main() {
    int rs;
    bool *res;

    /* Test 1 */
    {
        int e[][2] = {{0,1},{1,2}};
        int *ep[] = {e[0], e[1]};
        int ecs[] = {2, 2};
        char *q[] = {"query 0 2", "update 1 b", "query 0 2"};
        res = palindromePath(3, ep, 2, ecs, "aac", q, 3, &rs);
        assert(rs == 2 && res[0] == true && res[1] == false);
        free(res);
        printf("Test 1 passed\n");
    }

    /* Test 2 */
    {
        int e[][2] = {{0,1},{0,2},{0,3}};
        int *ep[] = {e[0], e[1], e[2]};
        int ecs[] = {2, 2, 2};
        char *q[] = {"query 1 2", "update 0 b", "query 2 3", "update 3 a", "query 1 3"};
        res = palindromePath(4, ep, 3, ecs, "abca", q, 5, &rs);
        assert(rs == 3 && res[0] == false && res[1] == false && res[2] == true);
        free(res);
        printf("Test 2 passed\n");
    }

    /* Test 3: single node */
    {
        char *q[] = {"query 0 0"};
        res = palindromePath(1, NULL, 0, NULL, "a", q, 1, &rs);
        assert(rs == 1 && res[0] == true);
        free(res);
        printf("Test 3 passed\n");
    }

    /* Test 4 */
    {
        int e[][2] = {{0,1}};
        int *ep[] = {e[0]};
        int ecs[] = {2};
        char *q[] = {"query 0 1"};
        res = palindromePath(2, ep, 1, ecs, "aa", q, 1, &rs);
        assert(rs == 1 && res[0] == true);
        free(res);
        printf("Test 4 passed\n");
    }

    /* Test 5 */
    {
        int e[][2] = {{0,1}};
        int *ep[] = {e[0]};
        int ecs[] = {2};
        char *q[] = {"query 0 1"};
        res = palindromePath(2, ep, 1, ecs, "ab", q, 1, &rs);
        assert(rs == 1 && res[0] == false);
        free(res);
        printf("Test 5 passed\n");
    }

    /* Test 6 */
    {
        int e[][2] = {{0,1},{1,2}};
        int *ep[] = {e[0], e[1]};
        int ecs[] = {2, 2};
        char *q[] = {"query 0 2"};
        res = palindromePath(3, ep, 2, ecs, "aaa", q, 1, &rs);
        assert(rs == 1 && res[0] == true);
        free(res);
        printf("Test 6 passed\n");
    }

    /* Test 7: query same node */
    {
        int e[][2] = {{0,1},{1,2}};
        int *ep[] = {e[0], e[1]};
        int ecs[] = {2, 2};
        char *q[] = {"query 1 1"};
        res = palindromePath(3, ep, 2, ecs, "abc", q, 1, &rs);
        assert(rs == 1 && res[0] == true);
        free(res);
        printf("Test 7 passed\n");
    }

    /* Test 8 */
    {
        int e[][2] = {{0,1},{1,2}};
        int *ep[] = {e[0], e[1]};
        int ecs[] = {2, 2};
        char *q[] = {"query 0 2", "update 1 a", "query 0 2"};
        res = palindromePath(3, ep, 2, ecs, "abc", q, 3, &rs);
        assert(rs == 2 && res[0] == false && res[1] == true);
        free(res);
        printf("Test 8 passed\n");
    }

    /* Test 9 */
    {
        int e[][2] = {{0,1},{1,2},{2,3},{3,4}};
        int *ep[] = {e[0], e[1], e[2], e[3]};
        int ecs[] = {2, 2, 2, 2};
        char *q[] = {"query 0 4", "query 1 3", "query 0 2"};
        res = palindromePath(5, ep, 4, ecs, "abcba", q, 3, &rs);
        assert(rs == 3 && res[0] == true && res[1] == true && res[2] == false);
        free(res);
        printf("Test 9 passed\n");
    }

    /* Test 10: star graph */
    {
        int e[100][2];
        int *ep[100];
        int ecs[100];
        for (int i = 0; i < 100; i++) {
            e[i][0] = 0; e[i][1] = i + 1;
            ep[i] = e[i];
            ecs[i] = 2;
        }
        char s[101];
        memset(s, 'a', 100);
        s[100] = 0;
        char *q[] = {"query 0 50", "query 1 99", "update 0 b", "query 0 50"};
        res = palindromePath(101, ep, 100, ecs, s, q, 4, &rs);
        assert(rs == 3 && res[0] == true && res[1] == true && res[2] == false);
        free(res);
        printf("Test 10 passed\n");
    }

    /* Test 11: chain graph, all same char */
    {
        int e[9][2];
        int *ep[9];
        int ecs[9];
        for (int i = 0; i < 9; i++) {
            e[i][0] = i; e[i][1] = i + 1;
            ep[i] = e[i]; ecs[i] = 2;
        }
        char *q[] = {"query 0 9", "query 0 4", "query 5 9"};
        res = palindromePath(10, ep, 9, ecs, "aaaaaaaaaa", q, 3, &rs);
        assert(rs == 3 && res[0] == true && res[1] == true && res[2] == true);
        free(res);
        printf("Test 11 passed (chain, all same)\n");
    }

    /* Test 12: alternating chars - even path length */
    {
        int e[][2] = {{0,1},{1,2},{2,3}};
        int *ep[] = {e[0], e[1], e[2]};
        int ecs[] = {2, 2, 2};
        char *q[] = {"query 0 3", "query 1 2"};
        res = palindromePath(4, ep, 3, ecs, "abab", q, 2, &rs);
        assert(rs == 2 && res[0] == true && res[1] == false);
        free(res);
        printf("Test 12 passed (alternating, even)\n");
    }

    /* Test 13: update then query back */
    {
        int e[][2] = {{0,1},{1,2}};
        int *ep[] = {e[0], e[1]};
        int ecs[] = {2, 2};
        char *q[] = {"query 0 2", "update 1 z", "query 0 2", "update 1 b", "query 0 2"};
        res = palindromePath(3, ep, 2, ecs, "abc", q, 5, &rs);
        assert(rs == 3 && res[0] == false && res[1] == false && res[2] == false);
        free(res);
        printf("Test 13 passed (update cycle)\n");
    }

    /* Test 14: deep tree */
    {
        int n14 = 1000;
        int *estress14 = (int *)malloc(sizeof(int) * 2 * (n14 - 1));
        int **epstress14 = (int **)malloc(sizeof(int *) * (n14 - 1));
        int *ecstress14 = (int *)malloc(sizeof(int) * (n14 - 1));
        for (int i = 0; i < n14 - 1; i++) {
            estress14[2*i] = i; estress14[2*i+1] = i+1;
            epstress14[i] = &estress14[2*i]; ecstress14[i] = 2;
        }
        char s14[1001];
        for (int i = 0; i < n14; i++) s14[i] = 'a' + i % 26;
        s14[n14] = 0;
        char *q14[] = {"query 0 999", "update 500 a", "query 0 999"};
        res = palindromePath(n14, epstress14, n14-1, ecstress14, s14, q14, 3, &rs);
        assert(rs == 2);
        free(res);
        free(estress14); free(epstress14); free(ecstress14);
        printf("Test 14 passed (deep tree n=1000)\n");
    }

    /* Test 15: star graph, query leaf-to-leaf */
    {
        int e[99][2];
        int *ep[99];
        int ecs[99];
        for (int i = 0; i < 99; i++) {
            e[i][0] = 0; e[i][1] = i + 1;
            ep[i] = e[i]; ecs[i] = 2;
        }
        char s15[100];
        memset(s15, 'a', 100);
        s15[0] = 'b'; /* center is 'b' */
        char *q15[] = {"query 1 2", "query 1 99", "query 50 51"};
        res = palindromePath(100, ep, 99, ecs, s15, q15, 3, &rs);
        assert(rs == 3 && res[0] == true && res[1] == true && res[2] == true);
        free(res);
        printf("Test 15 passed (star, leaf-to-leaf)\n");
    }

    printf("\nAll correctness tests passed!\n");

    /* Stress test: n=50000, Q=50000 */
    srand(42);
    int n = 50000;
    int qs = 50000;

    int *estress = (int *)malloc(sizeof(int) * 2 * (n - 1));
    int **epstress = (int **)malloc(sizeof(int *) * (n - 1));
    int *ecstress = (int *)malloc(sizeof(int) * (n - 1));
    for (int i = 0; i < n - 1; i++) {
        estress[2 * i] = i;
        estress[2 * i + 1] = i + 1;
        epstress[i] = &estress[2 * i];
        ecstress[i] = 2;
    }

    char *sstress = (char *)malloc(n + 1);
    for (int i = 0; i < n; i++)
        sstress[i] = 'a' + rand() % 26;
    sstress[n] = 0;

    char **qstress = (char **)malloc(sizeof(char *) * qs);
    for (int i = 0; i < qs; i++) {
        qstress[i] = (char *)malloc(32);
        if (rand() % 2 == 0) {
            int u = rand() % n, v = rand() % n;
            sprintf(qstress[i], "query %d %d", u, v);
        } else {
            int u = rand() % n;
            char c = 'a' + rand() % 26;
            sprintf(qstress[i], "update %d %c", u, c);
        }
    }

    clock_t start = clock();
    res = palindromePath(n, epstress, n - 1, ecstress, sstress, qstress, qs, &rs);
    clock_t end = clock();
    double elapsed = (double)(end - start) / CLOCKS_PER_SEC * 1000.0;

    printf("Stress test (n=%d, Q=%d): %.1f ms\n", n, qs, elapsed);
    printf("Result count: %d\n", rs);

    free(res);
    free(estress);
    free(epstress);
    free(ecstress);
    free(sstress);
    for (int i = 0; i < qs; i++) free(qstress[i]);
    free(qstress);

    /* Stress test 2: star graph n=50000 */
    {
        int n2 = 50000, qs2 = 50000;
        int *e2 = (int *)malloc(sizeof(int) * 2 * (n2 - 1));
        int **ep2 = (int **)malloc(sizeof(int *) * (n2 - 1));
        int *ec2 = (int *)malloc(sizeof(int) * (n2 - 1));
        for (int i = 0; i < n2 - 1; i++) {
            e2[2*i] = 0; e2[2*i+1] = i+1;
            ep2[i] = &e2[2*i]; ec2[i] = 2;
        }
        char *s2 = (char *)malloc(n2 + 1);
        for (int i = 0; i < n2; i++) s2[i] = 'a' + rand() % 26;
        s2[n2] = 0;
        char **q2 = (char **)malloc(sizeof(char *) * qs2);
        for (int i = 0; i < qs2; i++) {
            q2[i] = (char *)malloc(32);
            if (rand() % 2 == 0) {
                int u = rand() % n2, v = rand() % n2;
                sprintf(q2[i], "query %d %d", u, v);
            } else {
                int u = rand() % n2;
                char c = 'a' + rand() % 26;
                sprintf(q2[i], "update %d %c", u, c);
            }
        }
        clock_t start2 = clock();
        res = palindromePath(n2, ep2, n2-1, ec2, s2, q2, qs2, &rs);
        clock_t end2 = clock();
        printf("Stress test star (n=%d, Q=%d): %.1f ms\n", n2, qs2, (double)(end2-start2)/CLOCKS_PER_SEC*1000.0);
        free(res); free(e2); free(ep2); free(ec2); free(s2);
        for (int i = 0; i < qs2; i++) free(q2[i]);
        free(q2);
    }

    /* Stress test 3: balanced binary tree n=50000 */
    {
        int n3 = 50000, qs3 = 50000;
        int *e3 = (int *)malloc(sizeof(int) * 2 * (n3 - 1));
        int **ep3 = (int **)malloc(sizeof(int *) * (n3 - 1));
        int *ec3 = (int *)malloc(sizeof(int) * (n3 - 1));
        int ecnt3 = 0;
        for (int i = 0; i < n3; i++) {
            int left = 2*i+1, right = 2*i+2;
            if (left < n3) {
                e3[2*ecnt3] = i; e3[2*ecnt3+1] = left;
                ep3[ecnt3] = &e3[2*ecnt3]; ec3[ecnt3] = 2;
                ecnt3++;
            }
            if (right < n3) {
                e3[2*ecnt3] = i; e3[2*ecnt3+1] = right;
                ep3[ecnt3] = &e3[2*ecnt3]; ec3[ecnt3] = 2;
                ecnt3++;
            }
        }
        char *s3 = (char *)malloc(n3 + 1);
        for (int i = 0; i < n3; i++) s3[i] = 'a' + rand() % 26;
        s3[n3] = 0;
        char **q3 = (char **)malloc(sizeof(char *) * qs3);
        for (int i = 0; i < qs3; i++) {
            q3[i] = (char *)malloc(32);
            if (rand() % 2 == 0) {
                int u = rand() % n3, v = rand() % n3;
                sprintf(q3[i], "query %d %d", u, v);
            } else {
                int u = rand() % n3;
                char c = 'a' + rand() % 26;
                sprintf(q3[i], "update %d %c", u, c);
            }
        }
        clock_t start3 = clock();
        res = palindromePath(n3, ep3, ecnt3, ec3, s3, q3, qs3, &rs);
        clock_t end3 = clock();
        printf("Stress test binary tree (n=%d, Q=%d): %.1f ms\n", n3, qs3, (double)(end3-start3)/CLOCKS_PER_SEC*1000.0);
        free(res); free(e3); free(ep3); free(ec3); free(s3);
        for (int i = 0; i < qs3; i++) free(q3[i]);
        free(q3);
    }

    return 0;
}
#endif
