#!/usr/bin/env python3
"""
特斯拉车险（Tesla Insurance）精算分析
基于实时驾驶行为数据的 UBI 车险定价模型
"""
import json

# ============================================================
# 1. 特斯拉保险产品概述
# ============================================================
PRODUCT_OVERVIEW = {
    "name": "Tesla Insurance",
    "type": "UBI (Usage-Based Insurance) 基于使用行为的保险",
    "launch": "2019年8月（加州），已扩展至多个州",
    "coverage": {
        "bodily_injury": "人身伤害责任",
        "property_damage": "财产损失责任",
        "collision": "碰撞险",
        "comprehensive": "综合险（盗窃、自然灾害等）",
        "uninsured_motorist": "无保险驾驶人",
        "medical_payments": "医疗支付",
        "rental_reimbursement": "租车补偿",
    },
    "unique_features": [
        "实时驾驶行为评分（Safety Score）",
        "每月动态调整保费",
        "基于车辆传感器数据（摄像头、加速度计）",
        "不使用传统信用评分",
        "不使用年龄/性别作为主要因子（部分州）",
    ]
}

# ============================================================
# 2. Safety Score 评分体系
# ============================================================
SAFETY_SCORE = {
    "range": (0, 100),
    "default_score": 90,  # 新用户默认分
    "factors": {
        "forward_collision_warning": {
            "weight": 0.30,
            "description": "前碰撞预警次数/每千英里",
            "good_threshold": "< 1.0 次/千英里",
        },
        "hard_braking": {
            "weight": 0.25,
            "description": "急刹车次数（减速 > 0.4g）/每千英里",
            "good_threshold": "< 2.0 次/千英里",
        },
        "aggressive_turning": {
            "weight": 0.20,
            "description": "急转弯次数（横向加速度 > 0.3g）/每千英里",
            "good_threshold": "< 1.5 次/千英里",
        },
        "unsafe_following": {
            "weight": 0.15,
            "description": "不安全跟车距离时间占比",
            "good_threshold": "< 10%",
        },
        "forced_autopilot_disengagement": {
            "weight": 0.10,
            "description": "强制退出 Autopilot 次数",
            "good_threshold": "0 次",
        },
    }
}

# ============================================================
# 3. 精算假设（基于行业数据 + 特斯拉特点）
# ============================================================
ASSUMPTIONS = {
    # --- 车辆信息 ---
    "vehicle_models": {
        "Model 3": {"msrp": 38990, "theft_rate": 0.002, "repair_cost_factor": 1.0},
        "Model Y": {"msrp": 43990, "theft_rate": 0.002, "repair_cost_factor": 1.15},
        "Model S": {"msrp": 74990, "theft_rate": 0.003, "repair_cost_factor": 1.45},
        "Model X": {"msrp": 79990, "theft_rate": 0.003, "repair_cost_factor": 1.55},
        "Cybertruck": {"msrp": 60990, "theft_rate": 0.001, "repair_cost_factor": 1.30},
    },

    # --- 风险假设 ---
    "accident_frequency": 0.08,      # 事故频率 8%（含全责/主责）
    "theft_frequency": 0.003,        # 盗窃率 0.3%
    "glass_breakage_freq": 0.05,     # 玻璃破损率 5%

    "avg_collision_severity": 8500,   # 碰撞平均赔付（元）
    "avg_liability_severity": 12000,  # 责任平均赔付
    "avg_theft_severity": 35000,      # 盗窃平均赔付
    "avg_glass_severity": 1800,       # 玻璃平均赔付

    # --- Safety Score 调整因子 ---
    "score_adjustments": {
        95: 0.75,   # 95分以上，保费打75折
        90: 0.85,   # 90-94分，85折
        85: 1.00,   # 85-89分，标准费率
        80: 1.15,   # 80-84分，加费15%
        75: 1.35,   # 75-79分，加费35%
        70: 1.60,   # 70-74分，加费60%
        0:  2.00,   # 70分以下，翻倍
    },

    # --- 费用假设 ---
    "fixed_expense_per_policy": 150,      # 单均固定费用
    "variable_expense_ratio": 0.15,       # 可变费用率 15%（无代理人佣金）
    "profit_margin_ratio": 0.08,          # 利润率 8%
    "reinsurance_cost_ratio": 0.05,       # 再保成本 5%

    # --- 投资假设 ---
    "investment_yield": 0.04,             # 投资收益率 4%

    # --- 里程因子 ---
    "annual_mileage_base": 12000,         # 基准年里程（英里）
    "mileage_factors": {
        8000: 0.80,
        10000: 0.90,
        12000: 1.00,
        15000: 1.15,
        20000: 1.35,
        25000: 1.55,
    }
}


def calculate_tesla_premium(model, safety_score, annual_mileage, assumptions):
    """计算特斯拉保险保费"""
    vehicle = assumptions["vehicle_models"][model]
    msrp = vehicle["msrp"]
    repair_factor = vehicle["repair_cost_factor"]

    # --- Step 1: 纯风险保费 ---
    collision_risk = assumptions["accident_frequency"] * assumptions["avg_collision_severity"] * repair_factor
    liability_risk = assumptions["accident_frequency"] * assumptions["avg_liability_severity"]
    theft_risk = vehicle["theft_rate"] * assumptions["avg_theft_severity"]
    glass_risk = assumptions["glass_breakage_freq"] * assumptions["avg_glass_severity"]

    pure_risk_premium = collision_risk + liability_risk + theft_risk + glass_risk

    # --- Step 2: Safety Score 调整 ---
    score_factor = 1.0
    for threshold, factor in sorted(assumptions["score_adjustments"].items(), reverse=True):
        if safety_score >= threshold:
            score_factor = factor
            break

    # --- Step 3: 里程调整 ---
    mileage_factor = 1.0
    for threshold, factor in sorted(assumptions["mileage_factors"].items()):
        if annual_mileage <= threshold:
            mileage_factor = factor
            break
    else:
        mileage_factor = 1.75  # 超过25000英里

    # --- Step 4: 调整后风险保费 ---
    adjusted_risk_premium = pure_risk_premium * score_factor * mileage_factor

    # --- Step 5: 费用附加 ---
    denominator = 1.0 - assumptions["variable_expense_ratio"] - assumptions["profit_margin_ratio"] - assumptions["reinsurance_cost_ratio"]
    gross_premium = (adjusted_risk_premium + assumptions["fixed_expense_per_policy"]) / denominator

    # --- Step 6: 投资收益冲减 ---
    investment_income = gross_premium * 0.5 * assumptions["investment_yield"]
    final_premium = gross_premium - investment_income

    return {
        "model": model,
        "msrp": msrp,
        "safety_score": safety_score,
        "annual_mileage": annual_mileage,
        "collision_risk": round(collision_risk, 2),
        "liability_risk": round(liability_risk, 2),
        "theft_risk": round(theft_risk, 2),
        "glass_risk": round(glass_risk, 2),
        "pure_risk_premium": round(pure_risk_premium, 2),
        "score_factor": score_factor,
        "mileage_factor": mileage_factor,
        "adjusted_risk_premium": round(adjusted_risk_premium, 2),
        "gross_premium": round(gross_premium, 2),
        "investment_income": round(investment_income, 2),
        "final_premium": round(final_premium, 2),
    }


def generate_comparison_table(assumptions):
    """生成不同车型、不同评分的保费对比表"""
    results = []
    for model in assumptions["vehicle_models"]:
        for score in [95, 90, 85, 80, 75, 70]:
            result = calculate_tesla_premium(model, score, 12000, assumptions)
            results.append(result)
    return results


def profitability_analysis(assumptions, n_policies=100000):
    """盈利能力分析"""
    # 假设评分分布
    score_distribution = {
        95: 0.15,  # 15% 用户95分以上
        90: 0.25,  # 25% 90-94分
        85: 0.30,  # 30% 85-89分
        80: 0.15,  # 15% 80-84分
        75: 0.10,  # 10% 75-79分
        70: 0.05,  # 5% 70分以下
    }

    # 假设车型分布
    model_distribution = {
        "Model 3": 0.40,
        "Model Y": 0.35,
        "Model S": 0.10,
        "Model X": 0.10,
        "Cybertruck": 0.05,
    }

    weighted_premium = 0
    for model, model_pct in model_distribution.items():
        for score, score_pct in score_distribution.items():
            result = calculate_tesla_premium(model, score, 12000, assumptions)
            weighted_premium += result["final_premium"] * model_pct * score_pct

    total_premium = weighted_premium * n_policies
    investment_income = total_premium * 0.5 * assumptions["investment_yield"]
    total_income = total_premium + investment_income

    # 赔付成本（假设实际赔付率65%）
    expected_claims = total_premium * 0.65
    total_expenses = (total_premium * assumptions["variable_expense_ratio"]
                      + assumptions["fixed_expense_per_policy"] * n_policies
                      + total_premium * assumptions["reinsurance_cost_ratio"])

    underwriting_profit = total_income - expected_claims - total_expenses

    return {
        "n_policies": n_policies,
        "weighted_avg_premium": round(weighted_premium, 2),
        "total_premium_income": round(total_premium, 0),
        "investment_income": round(investment_income, 0),
        "total_income": round(total_income, 0),
        "expected_claims": round(expected_claims, 0),
        "total_expenses": round(total_expenses, 0),
        "underwriting_profit": round(underwriting_profit, 0),
        "profit_margin": round(underwriting_profit / total_premium * 100, 2),
        "combined_ratio": round((expected_claims + total_expenses) / total_premium * 100, 2),
    }


if __name__ == "__main__":
    print("=" * 70)
    print("  特斯拉车险（Tesla Insurance）精算分析报告")
    print("=" * 70)

    # ---- 产品概述 ----
    print("\n▌ 一、产品概述")
    print("-" * 50)
    print(f"  产品名称: {PRODUCT_OVERVIEW['name']}")
    print(f"  产品类型: {PRODUCT_OVERVIEW['type']}")
    print(f"  上线时间: {PRODUCT_OVERVIEW['launch']}")
    print(f"\n  核心特点:")
    for feat in PRODUCT_OVERVIEW["unique_features"]:
        print(f"    • {feat}")

    # ---- Safety Score 体系 ----
    print("\n▌ 二、Safety Score 评分体系")
    print("-" * 50)
    print(f"  评分范围: {SAFETY_SCORE['range'][0]} - {SAFETY_SCORE['range'][1]}")
    print(f"  新用户默认分: {SAFETY_SCORE['default_score']}")
    print(f"\n  {'因子':<25} {'权重':>6}  {'良好阈值':<20}")
    print("  " + "-" * 55)
    for name, factor in SAFETY_SCORE["factors"].items():
        label = {
            "forward_collision_warning": "前碰撞预警",
            "hard_braking": "急刹车",
            "aggressive_turning": "急转弯",
            "unsafe_following": "不安全跟车",
            "forced_autopilot_disengagement": "强制退出AP",
        }.get(name, name)
        print(f"  {label:<23} {factor['weight']*100:>5.0f}%  {factor['good_threshold']:<20}")

    # ---- 费率对比表 ----
    print("\n▌ 三、保费对比表（年缴，基准里程12,000英里）")
    print("-" * 70)
    print(f"  {'车型':<12} {'MSRP':>10} ", end="")
    for score in [95, 90, 85, 80, 75, 70]:
        print(f"{'S'+str(score):>8}", end="")
    print()
    print("  " + "-" * 65)

    for model in ASSUMPTIONS["vehicle_models"]:
        msrp = ASSUMPTIONS["vehicle_models"][model]["msrp"]
        print(f"  {model:<12} ${msrp:>8,}", end="")
        for score in [95, 90, 85, 80, 75, 70]:
            result = calculate_tesla_premium(model, score, 12000, ASSUMPTIONS)
            print(f"  ${result['final_premium']:>6,.0f}", end="")
        print()

    # ---- 保费分解 ----
    print("\n▌ 四、保费分解（Model Y，Safety Score 90，12,000英里）")
    print("-" * 50)
    result = calculate_tesla_premium("Model Y", 90, 12000, ASSUMPTIONS)
    print(f"  碰撞风险保费:    ${result['collision_risk']:>10,.2f}")
    print(f"  责任风险保费:    ${result['liability_risk']:>10,.2f}")
    print(f"  盗窃风险保费:    ${result['theft_risk']:>10,.2f}")
    print(f"  玻璃风险保费:    ${result['glass_risk']:>10,.2f}")
    print(f"  ─────────────────────────────")
    print(f"  纯风险保费:      ${result['pure_risk_premium']:>10,.2f}")
    print(f"  Score 调整因子:  {result['score_factor']:>10.2f}")
    print(f"  里程调整因子:    {result['mileage_factor']:>10.2f}")
    print(f"  调整后风险保费:  ${result['adjusted_risk_premium']:>10,.2f}")
    print(f"  毛保费:          ${result['gross_premium']:>10,.2f}")
    print(f"  投资收益冲减:    ${result['investment_income']:>10,.2f}")
    print(f"  ─────────────────────────────")
    print(f"  最终保费:        ${result['final_premium']:>10,.2f}")

    # ---- 里程敏感性 ----
    print("\n▌ 五、里程敏感性分析（Model Y，Score 90）")
    print("-" * 50)
    print(f"  {'年里程':>10}  {'里程因子':>8}  {'年保费':>10}  {'月保费':>8}")
    print("  " + "-" * 45)
    for mileage in [8000, 10000, 12000, 15000, 20000, 25000]:
        r = calculate_tesla_premium("Model Y", 90, mileage, ASSUMPTIONS)
        print(f"  {mileage:>8,}  {r['mileage_factor']:>8.2f}  ${r['final_premium']:>8,.0f}  ${r['final_premium']/12:>6,.0f}")

    # ---- 盈利测试 ----
    print("\n▌ 六、盈利能力测试（100,000 保单）")
    print("-" * 50)
    profit = profitability_analysis(ASSUMPTIONS)
    print(f"  保单数量:        {profit['n_policies']:>12,}")
    print(f"  加权平均保费:    ${profit['weighted_avg_premium']:>10,.2f}")
    print(f"  保费收入:        ${profit['total_premium_income']:>12,.0f}")
    print(f"  投资收益:        ${profit['investment_income']:>12,.0f}")
    print(f"  总收入:          ${profit['total_income']:>12,.0f}")
    print(f"  预期赔付:        ${profit['expected_claims']:>12,.0f}")
    print(f"  总费用:          ${profit['total_expenses']:>12,.0f}")
    print(f"  承保利润:        ${profit['underwriting_profit']:>12,.0f}")
    print(f"  ─────────────────────────────")
    print(f"  综合成本率:      {profit['combined_ratio']:>10.1f}%")
    print(f"  利润率:          {profit['profit_margin']:>10.1f}%")

    # ---- 与传统车险对比 ----
    print("\n▌ 七、Tesla Insurance vs 传统车险对比")
    print("-" * 70)
    comparison = [
        ("定价因子", "实时驾驶行为 + 车辆数据", "年龄/性别/信用分/历史记录"),
        ("保费调整", "每月动态调整", "年度续保调整"),
        ("代理人", "直销，无佣金", "代理人渠道，佣金15-20%"),
        ("理赔速度", "OTA诊断 + 快速定损", "传统定损流程"),
        ("数据来源", "车辆传感器实时数据", "历史理赔记录"),
        ("费用率", "15-20%", "25-35%"),
        ("风险选择", "正向选择（好司机）", "逆向选择风险"),
    ]
    print(f"  {'维度':<12} {'Tesla Insurance':<25} {'传统车险':<25}")
    print("  " + "-" * 65)
    for dim, tesla, trad in comparison:
        print(f"  {dim:<10} {tesla:<25} {trad:<25}")

    print("\n" + "=" * 70)
    print("  分析完成")
    print("=" * 70)
