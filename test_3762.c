/* Test harness for leetcode3762.c */
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <stdbool.h>
#include <time.h>

extern long long* minOperations(int* nums, int numsSize, int k, int** queries, int queriesSize, int* queriesColSize, int* returnSize);

static bool check(const char *name, int *nums, int n, int k, int **q, int qn, long long *exp, int exp_len) {
    int rs;
    long long *res = minOperations(nums, n, k, q, qn, NULL, &rs);
    bool ok = (rs == exp_len);
    if (ok) for (int i = 0; i < rs; i++) if (res[i] != exp[i]) { ok = false; break; }
    if (ok) printf("[PASS] %s\n", name);
    else {
        printf("[FAIL] %s\n  Expected: [", name);
        for (int i = 0; i < exp_len; i++) printf("%s%lld", i?",":"", exp[i]);
        printf("]\n  Got:      [");
        for (int i = 0; i < rs; i++) printf("%s%lld", i?",":"", res[i]);
        printf("]\n");
    }
    free(res);
    return ok;
}

int main() {
    int pass = 0, fail = 0;

    /* Test 1: 示例1 */
    {
        int nums[] = {1,4,7};
        int qd[][2] = {{0,1},{0,2}};
        int *qp[] = {qd[0],qd[1]};
        long long exp[] = {1,2};
        if (check("示例1", nums, 3, 3, qp, 2, exp, 2)) pass++; else fail++;
    }

    /* Test 2: 示例2 */
    {
        int nums[] = {1,2,4};
        int qd[][2] = {{0,2},{0,0},{1,2}};
        int *qp[] = {qd[0],qd[1],qd[2]};
        long long exp[] = {-1,0,1};
        if (check("示例2", nums, 3, 2, qp, 3, exp, 3)) pass++; else fail++;
    }

    /* Test 3: 单元素 */
    {
        int nums[] = {5};
        int qd[][2] = {{0,0}};
        int *qp[] = {qd[0]};
        long long exp[] = {0};
        if (check("单元素", nums, 1, 3, qp, 1, exp, 1)) pass++; else fail++;
    }

    /* Test 4: 全相同 */
    {
        int nums[] = {3,3,3,3};
        int qd[][2] = {{0,3},{1,2}};
        int *qp[] = {qd[0],qd[1]};
        long long exp[] = {0,0};
        if (check("全相同", nums, 4, 1, qp, 2, exp, 2)) pass++; else fail++;
    }

    /* Test 5: 相邻两元素 */
    {
        int nums[] = {1,4};
        int qd[][2] = {{0,1}};
        int *qp[] = {qd[0]};
        long long exp[] = {1};
        if (check("相邻两元素", nums, 2, 3, qp, 1, exp, 1)) pass++; else fail++;
    }

    /* Test 6: 余数不同 */
    {
        int nums[] = {1,2,3};
        int qd[][2] = {{0,2}};
        int *qp[] = {qd[0]};
        long long exp[] = {-1};
        if (check("余数不同", nums, 3, 3, qp, 1, exp, 1)) pass++; else fail++;
    }

    /* Test 7: 大间距 */
    {
        int nums[] = {1,10,100};
        int qd[][2] = {{0,2}};
        int *qp[] = {qd[0]};
        long long exp[] = {33};
        if (check("大间距", nums, 3, 3, qp, 1, exp, 1)) pass++; else fail++;
    }

    /* Test 8: 已有序 */
    {
        int nums[] = {2,4,6,8};
        int qd[][2] = {{0,3}};
        int *qp[] = {qd[0]};
        long long exp[] = {4};
        if (check("已有序", nums, 4, 2, qp, 1, exp, 1)) pass++; else fail++;
    }

    /* Test 9: 全部不可行 */
    {
        int nums[] = {1,2,3,4,5};
        int qd[][2] = {{0,1},{0,2},{2,4}};
        int *qp[] = {qd[0],qd[1],qd[2]};
        long long exp[] = {-1,-1,-1};
        if (check("全部不可行", nums, 5, 3, qp, 3, exp, 3)) pass++; else fail++;
    }

    /* Test 10: 混合查询 */
    {
        int nums[] = {3,6,9,12};
        int qd[][2] = {{0,0},{0,1},{0,3},{1,3}};
        int *qp[] = {qd[0],qd[1],qd[2],qd[3]};
        long long exp[] = {0,1,4,2};  /* [0,3]: a=[1,2,3,4], median=2, cost=4 */
        if (check("混合查询", nums, 4, 3, qp, 4, exp, 4)) pass++; else fail++;
    }

    /* Test 11: 全是同一个余数, 偶数个元素 */
    {
        int nums[] = {1,4,7,10};
        int qd[][2] = {{0,3}};
        int *qp[] = {qd[0]};
        long long exp[] = {4};  /* a=[0,1,2,3], median=1, cost=|0-1|+|1-1|+|2-1|+|3-1|=4 */
        if (check("偶数个元素", nums, 4, 3, qp, 1, exp, 1)) pass++; else fail++;
    }

    printf("\nResults: %d passed, %d failed\n", pass, fail);

    /* Stress test */
    printf("\n--- Stress test ---\n");
    srand(42);
    int n = 40000, qs = 40000, k = 100;
    int *nums_s = malloc(sizeof(int) * n);
    for (int i = 0; i < n; i++) nums_s[i] = (rand() % 1000) * k + (rand() % k);
    int **q_ptrs = malloc(sizeof(int *) * qs);
    int *q_data = malloc(sizeof(int) * qs * 2);
    for (int i = 0; i < qs; i++) {
        int l = rand() % n, r = rand() % n;
        if (l > r) { int t = l; l = r; r = t; }
        q_data[2*i] = l; q_data[2*i+1] = r;
        q_ptrs[i] = &q_data[2*i];
    }
    int rs;
    clock_t start = clock();
    long long *res = minOperations(nums_s, n, k, q_ptrs, qs, NULL, &rs);
    clock_t end = clock();
    printf("Stress (n=%d, Q=%d): %.1f ms, results=%d\n", n, qs, (double)(end-start)/CLOCKS_PER_SEC*1000.0, rs);
    free(res); free(nums_s); free(q_ptrs); free(q_data);

    return fail;
}
