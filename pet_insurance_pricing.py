#!/usr/bin/env python3
"""
宠物医疗险精算定价模型
Pet Medical Insurance Actuarial Pricing Model
"""
import json

# ============================================================
# 1. 产品设计参数
# ============================================================
PRODUCT_CONFIG = {
    "name": "萌宠安心保",
    "coverage": {
        "accident": 5000,       # 意外医疗保额（元）
        "illness": 10000,       # 疾病医疗保额（元）
        "surgery": 20000,       # 手术费用保额（元）
        "deductible": 200,      # 免赔额（元/次）
        "reimbursement": 0.7,   # 报销比例 70%
    },
    "target_pets": ["犬", "猫"],
    "age_range": "0-8岁",
    "waiting_period": 30,       # 等待期（天）
}

# ============================================================
# 2. 精算假设（基于行业数据）
# ============================================================
ASSUMPTIONS = {
    # --- 风险假设 ---
    "accident_frequency": 0.15,     # 意外发生率 15%
    "illness_frequency": 0.35,      # 疾病发生率 35%
    "surgery_frequency": 0.08,      # 手术发生率 8%

    "accident_avg_severity": 1500,  # 意外平均赔付（元）
    "illness_avg_severity": 3000,   # 疾病平均赔付（元）
    "surgery_avg_severity": 8000,   # 手术平均赔付（元）

    # --- 费用假设 ---
    "fixed_expense_per_policy": 50,     # 单均固定费用（元）
    "variable_expense_ratio": 0.20,     # 可变费用率（佣金+管理）20%
    "profit_margin_ratio": 0.08,        # 利润率 8%
    "reinsurance_cost_ratio": 0.03,     # 再保成本 3%

    # --- 投资假设 ---
    "investment_yield": 0.03,           # 投资收益率 3%
    "reserve_duration_years": 1,        # 准备金持有期限

    # --- 风险附加 ---
    "risk_loading_factor": 0.15,        # 风险附加系数 15%
}

# ============================================================
# 3. 犬/猫分类费率调整因子
# ============================================================
BREED_ADJUSTMENTS = {
    "犬": {
        "小型犬 (<10kg)": 0.85,
        "中型犬 (10-25kg)": 1.00,
        "大型犬 (25-45kg)": 1.20,
        "巨型犬 (>45kg)": 1.45,
    },
    "猫": {
        "家猫": 0.80,
        "品种猫": 1.10,
    },
}

AGE_ADJUSTMENTS = {
    "0-1岁": 0.75,   # 幼宠，等待期过滤部分风险
    "2-4岁": 1.00,   # 标准费率
    "5-6岁": 1.30,   # 中老年
    "7-8岁": 1.65,   # 老年
}


def calculate_pricing(assumptions):
    """计算精算定价"""
    a = assumptions

    # --- Step 1: 纯风险保费（Pure Risk Premium）---
    expected_accident = a["accident_frequency"] * a["accident_avg_severity"]
    expected_illness = a["illness_frequency"] * a["illness_avg_severity"]
    expected_surgery = a["surgery_frequency"] * a["surgery_avg_severity"]

    pure_risk_premium = expected_accident + expected_illness + expected_surgery

    # --- Step 2: 风险附加（Risk Loading）---
    risk_loading = pure_risk_premium * a["risk_loading_factor"]

    # --- Step 3: 期望赔付总额 ---
    expected_claims_total = pure_risk_premium + risk_loading

    # --- Step 4: 费用附加 ---
    # Gross Premium = (Claims + Fixed Expense) / (1 - Variable Ratio - Profit - Reinsurance)
    denominator = 1.0 - a["variable_expense_ratio"] - a["profit_margin_ratio"] - a["reinsurance_cost_ratio"]

    if denominator <= 0:
        raise ValueError("费用率+利润率+再保成本 超过100%，无法定价")

    gross_premium = (expected_claims_total + a["fixed_expense_per_policy"]) / denominator

    # --- Step 5: 各项分解 ---
    variable_expense = gross_premium * a["variable_expense_ratio"]
    profit = gross_premium * a["profit_margin_ratio"]
    reinsurance_cost = gross_premium * a["reinsurance_cost_ratio"]
    total_expense = variable_expense + a["fixed_expense_per_policy"] + reinsurance_cost

    # --- Step 6: 投资收益对保费的冲减 ---
    avg_reserve = gross_premium * 0.5  # 平均准备金约为保费的50%
    investment_income = avg_reserve * a["investment_yield"]
    adjusted_premium = gross_premium - investment_income

    return {
        "pure_risk_premium": round(pure_risk_premium, 2),
        "risk_loading": round(risk_loading, 2),
        "expected_claims_total": round(expected_claims_total, 2),
        "total_expense": round(total_expense, 2),
        "profit": round(profit, 2),
        "investment_income": round(investment_income, 2),
        "gross_premium": round(gross_premium, 2),
        "adjusted_premium": round(adjusted_premium, 2),
        "loss_ratio_target": round(expected_claims_total / gross_premium, 4),
    }


def generate_rate_table(base_premium):
    """生成分类费率表"""
    rate_table = {}
    for pet_type, breeds in BREED_ADJUSTMENTS.items():
        rate_table[pet_type] = {}
        for breed_name, breed_factor in breeds.items():
            rate_table[pet_type][breed_name] = {}
            for age_name, age_factor in AGE_ADJUSTMENTS.items():
                premium = round(base_premium * breed_factor * age_factor, 0)
                # 向上取整到10元
                premium = int(((premium + 9) // 10) * 10)
                rate_table[pet_type][breed_name][age_name] = premium
    return rate_table


def profitability_test(annual_premium, assumptions, n_policies=10000):
    """盈利能力测试"""
    a = assumptions
    total_premium = annual_premium * n_policies

    # 收入
    investment_income = total_premium * 0.5 * a["investment_yield"]
    total_income = total_premium + investment_income

    # 支出
    expected_claims = total_premium * (1 - a["variable_expense_ratio"]
                                        - a["profit_margin_ratio"]
                                        - a["reinsurance_cost_ratio"]) \
                      - a["fixed_expense_per_policy"] * n_policies

    total_claims = expected_claims
    total_expenses = (total_premium * a["variable_expense_ratio"]
                      + a["fixed_expense_per_policy"] * n_policies
                      + total_premium * a["reinsurance_cost_ratio"])

    underwriting_profit = total_income - total_claims - total_expenses
    combined_ratio = (total_claims + total_expenses) / total_premium

    return {
        "n_policies": n_policies,
        "total_premium_income": round(total_premium, 0),
        "investment_income": round(investment_income, 0),
        "total_income": round(total_income, 0),
        "expected_claims": round(total_claims, 0),
        "total_expenses": round(total_expenses, 0),
        "underwriting_profit": round(underwriting_profit, 0),
        "profit_margin": round(underwriting_profit / total_premium * 100, 2),
        "combined_ratio": round(combined_ratio * 100, 2),
        "loss_ratio": round(total_claims / total_premium * 100, 2),
        "expense_ratio": round(total_expenses / total_premium * 100, 2),
    }


if __name__ == "__main__":
    print("=" * 60)
    print("  宠物医疗险精算定价报告  ——  萌宠安心保")
    print("=" * 60)

    # ---- 定价计算 ----
    result = calculate_pricing(ASSUMPTIONS)

    print("\n▌ 一、定价假设")
    print("-" * 40)
    print(f"  意外发生率:    {ASSUMPTIONS['accident_frequency']*100:.1f}%")
    print(f"  疾病发生率:    {ASSUMPTIONS['illness_frequency']*100:.1f}%")
    print(f"  手术发生率:    {ASSUMPTIONS['surgery_frequency']*100:.1f}%")
    print(f"  意外均赔:      ¥{ASSUMPTIONS['accident_avg_severity']:,}")
    print(f"  疾病均赔:      ¥{ASSUMPTIONS['illness_avg_severity']:,}")
    print(f"  手术均赔:      ¥{ASSUMPTIONS['surgery_avg_severity']:,}")
    print(f"  风险附加系数:  {ASSUMPTIONS['risk_loading_factor']*100:.0f}%")
    print(f"  可变费用率:    {ASSUMPTIONS['variable_expense_ratio']*100:.0f}%")
    print(f"  利润率目标:    {ASSUMPTIONS['profit_margin_ratio']*100:.0f}%")
    print(f"  再保成本:      {ASSUMPTIONS['reinsurance_cost_ratio']*100:.0f}%")

    print("\n▌ 二、保费分解")
    print("-" * 40)
    print(f"  纯风险保费:    ¥{result['pure_risk_premium']:>10,.2f}")
    print(f"  风险附加:      ¥{result['risk_loading']:>10,.2f}")
    print(f"  期望赔付合计:  ¥{result['expected_claims_total']:>10,.2f}")
    print(f"  费用附加合计:  ¥{result['total_expense']:>10,.2f}")
    print(f"  利润附加:      ¥{result['profit']:>10,.2f}")
    print(f"  投资收益冲减:  ¥{result['investment_income']:>10,.2f}")
    print(f"  ─────────────────────────────")
    print(f"  毛保费:        ¥{result['gross_premium']:>10,.2f}")
    print(f"  调整后保费:    ¥{result['adjusted_premium']:>10,.2f}")
    print(f"  目标赔付率:    {result['loss_ratio_target']*100:.1f}%")

    # ---- 费率表 ----
    print("\n▌ 三、分类费率表（年缴保费/元）")
    print("-" * 60)
    rate_table = generate_rate_table(result["adjusted_premium"])
    for pet_type, breeds in rate_table.items():
        print(f"\n  【{pet_type}】")
        header = f"  {'品种':<18}"
        for age in AGE_ADJUSTMENTS:
            header += f"{age:>8}"
        print(header)
        print("  " + "-" * 50)
        for breed, ages in breeds.items():
            row = f"  {breed:<16}"
            for age, premium in ages.items():
                row += f"  ¥{premium:>5}"
            print(row)

    # ---- 盈利测试 ----
    print("\n▌ 四、盈利能力测试（假设10,000单）")
    print("-" * 40)
    profit_test = profitability_test(result["adjusted_premium"], ASSUMPTIONS)
    print(f"  保单数量:      {profit_test['n_policies']:>10,}")
    print(f"  保费收入:      ¥{profit_test['total_premium_income']:>12,.0f}")
    print(f"  投资收益:      ¥{profit_test['investment_income']:>12,.0f}")
    print(f"  总收入:        ¥{profit_test['total_income']:>12,.0f}")
    print(f"  预期赔付:      ¥{profit_test['expected_claims']:>12,.0f}")
    print(f"  总费用:        ¥{profit_test['total_expenses']:>12,.0f}")
    print(f"  承保利润:      ¥{profit_test['underwriting_profit']:>12,.0f}")
    print(f"  ─────────────────────────────")
    print(f"  赔付率:        {profit_test['loss_ratio']:>10.1f}%")
    print(f"  费用率:        {profit_test['expense_ratio']:>10.1f}%")
    print(f"  综合成本率:    {profit_test['combined_ratio']:>10.1f}%")
    print(f"  利润率:        {profit_test['profit_margin']:>10.1f}%")

    # ---- 敏感性分析（实际赔付偏离预期时的利润影响）----
    print("\n▌ 五、敏感性分析（实际赔付偏离预期时的利润影响）")
    print("-" * 60)
    print(f"  保费固定为 ¥{result['adjusted_premium']:,.0f}，观察实际赔付波动的影响")
    print(f"  {'赔付波动':>10}  {'实际赔付率':>10}  {'综合成本率':>10}  {'利润率':>8}  {'承保利润':>12}")
    print("  " + "-" * 58)
    base_claims = result["expected_claims_total"]
    premium = result["adjusted_premium"]
    n = 10000
    total_premium = premium * n
    investment_income = total_premium * 0.5 * ASSUMPTIONS["investment_yield"]
    fixed_exp = ASSUMPTIONS["fixed_expense_per_policy"] * n
    var_exp = total_premium * ASSUMPTIONS["variable_expense_ratio"]
    reinsurance = total_premium * ASSUMPTIONS["reinsurance_cost_ratio"]
    total_expense = fixed_exp + var_exp + reinsurance

    for adj in [0.80, 0.90, 1.00, 1.10, 1.20, 1.30]:
        actual_claims = base_claims * adj * n
        total_income = total_premium + investment_income
        underwriting_profit = total_income - actual_claims - total_expense
        profit_margin = underwriting_profit / total_premium * 100
        loss_ratio = actual_claims / total_premium * 100
        combined_ratio = (actual_claims + total_expense) / total_premium * 100
        print(f"  {adj*100:>8.0f}%   {loss_ratio:>9.1f}%   {combined_ratio:>9.1f}%   {profit_margin:>7.1f}%   ¥{underwriting_profit:>11,.0f}")

    print("\n" + "=" * 60)
    print("  报告结束")
    print("=" * 60)
