#include <vector>
#include <algorithm>
using namespace std;

class Solution {
public:
    vector<long long> minOperations(vector<int>& nums, int k, vector<vector<int>>& queries) {
        int n = nums.size();

        vector<int> rem(n);
        vector<long long> a(n);
        for (int i = 0; i < n; i++) {
            rem[i] = nums[i] % k;
            a[i] = (long long)nums[i] / k;
        }

        // 坐标压缩
        vector<long long> comp = a;
        sort(comp.begin(), comp.end());
        comp.erase(unique(comp.begin(), comp.end()), comp.end());
        int M = comp.size();

        // Sparse table for remainder
        int LOG = 0;
        while ((1 << LOG) <= n) LOG++;
        vector<vector<int>> stMin(LOG, vector<int>(n)), stMax(LOG, vector<int>(n));
        for (int i = 0; i < n; i++) stMin[0][i] = stMax[0][i] = rem[i];
        for (int j = 1; j < LOG; j++)
            for (int i = 0; i + (1 << j) <= n; i++) {
                stMin[j][i] = min(stMin[j - 1][i], stMin[j - 1][i + (1 << (j - 1))]);
                stMax[j][i] = max(stMax[j - 1][i], stMax[j - 1][i + (1 << (j - 1))]);
            }

        // Persistent Segment Tree - 关键: 路径上每层都创建新节点, 绝不复用旧节点
        struct Node { int l, r, cnt; long long sum; };
        vector<Node> t;
        t.reserve(n * 18 + 1);
        t.push_back({0, 0, 0, 0});  // node 0 = null
        vector<int> rt(n + 1, 0);

        for (int i = 0; i < n; i++) {
            int pos = (int)(lower_bound(comp.begin(), comp.end(), a[i]) - comp.begin());
            int prev = rt[i];
            int path[20], dir[20], sz = 0;
            int lo = 0, hi = M - 1, p = prev;
            // 自顶向下: 每层都创建新节点
            while (lo < hi) {
                int cur = t.size();
                t.push_back({t[p].l, t[p].r, t[p].cnt + 1, t[p].sum + a[i]});
                path[sz] = cur;
                int mid = (lo + hi) >> 1;
                if (pos <= mid) {
                    dir[sz] = 0;
                    p = t[p].l;
                    hi = mid;
                } else {
                    dir[sz] = 1;
                    p = t[p].r;
                    lo = mid + 1;
                }
                sz++;
            }
            // 叶子: 也创建新节点
            {
                int cur = t.size();
                t.push_back({t[p].l, t[p].r, t[p].cnt + 1, t[p].sum + a[i]});
                path[sz++] = cur;
            }
            // 自底向上修复子指针
            for (int j = sz - 2; j >= 0; j--) {
                if (dir[j] == 0) t[path[j]].l = path[j + 1];
                else             t[path[j]].r = path[j + 1];
            }
            rt[i + 1] = path[0];
        }

        // kth smallest in [l, r]
        auto kth = [&](int u, int v, int k) -> int {
            int lo = 0, hi = M - 1;
            while (lo < hi) {
                int mid = (lo + hi) >> 1;
                int cntL = t[t[v].l].cnt - t[t[u].l].cnt;
                if (k <= cntL) { u = t[u].l; v = t[v].l; hi = mid; }
                else { k -= cntL; u = t[u].r; v = t[v].r; lo = mid + 1; }
            }
            return lo;
        };

        // sum of elements <= comp[pos] in [l, r]
        auto sumLE = [&](int u, int v, int pos) -> long long {
            if (pos < 0) return 0;
            int lo = 0, hi = M - 1;
            long long res = 0;
            while (lo < hi) {
                if (pos >= hi) return res + (t[v].sum - t[u].sum);  // 整个区间都 <= pos
                int mid = (lo + hi) >> 1;
                if (pos <= mid) { u = t[u].l; v = t[v].l; hi = mid; }
                else { res += t[t[v].l].sum - t[t[u].l].sum; u = t[u].r; v = t[v].r; lo = mid + 1; }
            }
            return res;
        };

        vector<long long> ans;
        for (auto& q : queries) {
            int l = q[0], r = q[1];
            int len = r - l + 1;

            int j = 31 - __builtin_clz(len);
            int mn = min(stMin[j][l], stMin[j][r - (1 << j) + 1]);
            int mx = max(stMax[j][l], stMax[j][r - (1 << j) + 1]);
            if (mn != mx) { ans.push_back(-1); continue; }

            int m = (len + 1) / 2;
            int idx = kth(rt[l], rt[r + 1], m);
            long long median = comp[idx];
            long long sumLow = sumLE(rt[l], rt[r + 1], idx - 1);
            long long sumAll = t[rt[r + 1]].sum - t[rt[l]].sum;
            long long cntLow = m - 1;
            long long cntHigh = len - cntLow - 1;
            long long sumHigh = sumAll - sumLow - median;
            ans.push_back(median * cntLow - sumLow + sumHigh - median * cntHigh);
        }

        return ans;
    }
};
