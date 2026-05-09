#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <time.h>

extern int numberOfRoutes(char** grid, int gridSize, int d);

static int check(const char *name, char **grid, int n, int d, int expected) {
    int got = numberOfRoutes(grid, n, d);
    if (got == expected) { printf("[PASS] %s\n", name); return 1; }
    printf("[FAIL] %s: expected %d, got %d\n", name, expected, got);
    return 0;
}

int main() {
    int pass = 0, fail = 0;

    /* Test 1 */
    { char r0[]="..", r1[]="#."; char *g[]={r0,r1};
      if(check("示例1 d=1", g, 2, 1, 2)) pass++; else fail++; }

    /* Test 2 */
    { char r0[]="..", r1[]="#."; char *g[]={r0,r1};
      if(check("示例2 d=2", g, 2, 2, 4)) pass++; else fail++; }

    /* Test 3 */
    { char r0[]="#"; char *g[]={r0};
      if(check("示例3", g, 1, 750, 0)) pass++; else fail++; }

    /* Test 4 */
    { char r0[]=".."; char *g[]={r0};
      if(check("示例4", g, 1, 1, 4)) pass++; else fail++; }

    /* Test 5 */
    { char r0[]="##", r1[]="##"; char *g[]={r0,r1};
      if(check("全阻塞", g, 2, 1, 0)) pass++; else fail++; }

    /* Test 6 */
    { char r0[]="."; char *g[]={r0};
      if(check("单格", g, 1, 1, 1)) pass++; else fail++; }

    /* Test 7 */
    { char r0[]=".", r1[]=".", r2[]="."; char *g[]={r0,r1,r2};
      if(check("3行单列", g, 3, 1, 1)) pass++; else fail++; }

    /* Test 8 */
    { char r0[]="..", r1[]=".."; char *g[]={r0,r1};
      if(check("2x2 d=750", g, 2, 750, 16)) pass++; else fail++; }

    /* Test 9 */
    { char r0[]="..", r1[]=".."; char *g[]={r0,r1};
      if(check("2x2 d=1000", g, 2, 1000, 16)) pass++; else fail++; }

    /* Test 10 */
    { char r0[]="...", r1[]="...", r2[]="..."; char *g[]={r0,r1,r2};
      if(check("3x3 d=1", g, 3, 1, 41)) pass++; else fail++; }

    /* Test 11 */
    { char r0[]=".#.", r1[]=".#.", r2[]=".#."; char *g[]={r0,r1,r2};
      if(check("3x3 中间阻塞 d=1", g, 3, 1, 2)) pass++; else fail++; }

    /* Test 12 */
    { char r0[]=".#.", r1[]=".#.", r2[]=".#."; char *g[]={r0,r1,r2};
      if(check("3x3 中间阻塞 d=2", g, 3, 2, 16)) pass++; else fail++; }

    /* Test 13 */
    { char r0[]="..."; char *g[]={r0};
      if(check("单行3列 d=1", g, 1, 1, 7)) pass++; else fail++; }

    /* Test 14 */
    { char r0[]="..."; char *g[]={r0};
      if(check("单行3列 d=2", g, 1, 2, 9)) pass++; else fail++; }

    printf("\nResults: %d passed, %d failed\n", pass, fail);

    /* Stress test */
    printf("\n--- Stress test ---\n");
    srand(42);
    int n = 750, m = 750, d_val = 750;
    char **big_grid = (char **)malloc(sizeof(char *) * n);
    for (int i = 0; i < n; i++) {
        big_grid[i] = (char *)malloc(m + 1);
        for (int j = 0; j < m; j++)
            big_grid[i][j] = (rand() % 10 == 0) ? '#' : '.';
        big_grid[i][m] = '\0';
    }
    /* Warm up */
    numberOfRoutes(big_grid, n, d_val);
    /* Benchmark */
    double times[5];
    for (int t = 0; t < 5; t++) {
        clock_t start = clock();
        int result = numberOfRoutes(big_grid, n, d_val);
        clock_t end = clock();
        times[t] = (double)(end - start) / CLOCKS_PER_SEC * 1000.0;
        if (t == 0) printf("Result: %d\n", result);
    }
    double best = times[0];
    for (int t = 1; t < 5; t++) if (times[t] < best) best = times[t];
    printf("750x750 d=750: best=%.1f ms\n", best);

    for (int i = 0; i < n; i++) free(big_grid[i]);
    free(big_grid);
    return fail;
}
