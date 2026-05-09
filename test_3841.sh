#!/bin/bash
gcc -O2 -o leetcode3841_stdin /Users/harden/workspace/leetcode3841_stdin.c

PASS=0
FAIL=0

run_test() {
    local name="$1"
    local input="$2"
    local expected="$3"

    actual=$(echo "$input" | ./leetcode3841_stdin)

    if [ "$actual" = "$expected" ]; then
        echo "[PASS] $name"
        PASS=$((PASS + 1))
    else
        echo "[FAIL] $name"
        echo "  Expected: $expected"
        echo "  Actual:   $actual"
        FAIL=$((FAIL + 1))
    fi
}

# Test 1: 示例1
run_test "示例1" \
"3
0 1
1 2
aac
3
query 0 2
update 1 b
query 0 2" \
"true
false"

# Test 2: 示例2
run_test "示例2" \
"4
0 1
0 2
0 3
abca
5
query 1 2
update 0 b
query 2 3
update 3 a
query 1 3" \
"false
false
true"

# Test 3: 单节点
run_test "单节点" \
"1
a
1
query 0 0" \
"true"

# Test 4: 两节点回文
run_test "两节点回文" \
"2
0 1
aa
1
query 0 1" \
"true"

# Test 5: 两节点非回文
run_test "两节点非回文" \
"2
0 1
ab
1
query 0 1" \
"false"

# Test 6: 三节点全a
run_test "三节点全a" \
"3
0 1
1 2
aaa
1
query 0 2" \
"true"

# Test 7: 同一节点查询
run_test "同一节点查询" \
"3
0 1
1 2
abc
1
query 1 1" \
"true"

# Test 8: abc 更新后回文
run_test "abc更新后回文" \
"3
0 1
1 2
abc
3
query 0 2
update 1 a
query 0 2" \
"false
true"

# Test 9: abcba 链
run_test "abcba链" \
"5
0 1
1 2
2 3
3 4
abcba
3
query 0 4
query 1 3
query 0 2" \
"true
true
false"

echo ""
echo "Results: $PASS passed, $FAIL failed"

rm -f leetcode3841_stdin
