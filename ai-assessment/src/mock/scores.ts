import type { MonthlyScore, DimensionScore, Grade, Notification, UsageRecord } from '../types';
import { members } from './members';
import { aiTools } from './teams';
import { calculateGrade, calculateTotalScore } from '../utils/scoring';

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return s / 2147483647;
  };
}

const rand = seededRandom(123);

const months = ['2025-10', '2025-11', '2025-12', '2026-01', '2026-02', '2026-03'];

function genDimensions(base: number): DimensionScore {
  return {
    frequency: Math.min(100, Math.max(0, Math.round(base + (rand() - 0.5) * 40))),
    depth: Math.min(100, Math.max(0, Math.round(base + (rand() - 0.5) * 40))),
    output: Math.min(100, Math.max(0, Math.round(base + (rand() - 0.5) * 40))),
    contribution: Math.min(100, Math.max(0, Math.round(base + (rand() - 0.5) * 50))),
  };
}

function genToolUsage(): Record<string, number> {
  const usage: Record<string, number> = {};
  const count = Math.floor(rand() * 5) + 2;
  for (let i = 0; i < count; i++) {
    const tool = aiTools[Math.floor(rand() * aiTools.length)];
    usage[tool.id] = Math.floor(rand() * 30) + 1;
  }
  return usage;
}

export const monthlyScores: MonthlyScore[] = [];

for (const month of months) {
  const monthScores: MonthlyScore[] = [];
  for (const member of members) {
    const base = 30 + rand() * 55;
    const dimensions = genDimensions(base);
    const totalScore = calculateTotalScore(dimensions);
    const grade = calculateGrade(totalScore);
    monthScores.push({
      memberId: member.id,
      month,
      dimensions,
      totalScore,
      grade,
      rank: 0,
      toolUsage: genToolUsage(),
    });
  }
  monthScores.sort((a, b) => b.totalScore - a.totalScore);
  monthScores.forEach((s, i) => { s.rank = i + 1; });
  monthlyScores.push(...monthScores);
}

const scenarios = [
  '代码生成', '代码审查', '文档撰写', '数据分析', 'UI设计',
  '测试用例生成', '需求分析', '方案设计', '问题排查', '知识学习',
];

export const usageRecords: UsageRecord[] = [];
let recordId = 1;
for (const member of members) {
  const count = Math.floor(rand() * 20) + 5;
  for (let i = 0; i < count; i++) {
    const tool = aiTools[Math.floor(rand() * aiTools.length)];
    const monthIdx = Math.floor(rand() * months.length);
    const day = String(Math.floor(rand() * 28) + 1).padStart(2, '0');
    usageRecords.push({
      id: `r${recordId++}`,
      memberId: member.id,
      toolId: tool.id,
      date: `${months[monthIdx]}-${day}`,
      scenario: scenarios[Math.floor(rand() * scenarios.length)],
      duration: Math.floor(rand() * 120) + 5,
      output: '使用AI辅助完成工作任务',
      selfRating: Math.floor(rand() * 5) + 1,
      shared: rand() > 0.6,
    });
  }
}

const notifTemplates: Array<{ type: Notification['type']; title: string; content: string }> = [
  { type: 'score_result', title: '月度评分已出', content: '您的2026年2月AI使用评分已出，请查看详情。' },
  { type: 'reminder', title: '本周AI使用记录提醒', content: '您本周还未提交AI使用记录，请及时补充。' },
  { type: 'achievement', title: '恭喜获得「AI先锋」称号', content: '您连续3个月评分A级以上，获得AI先锋称号！' },
  { type: 'system', title: '考核规则更新通知', content: '2026年Q2考核权重已更新，深度维度权重提升至35%。' },
  { type: 'score_result', title: '季度考核结果公布', content: 'Q1季度考核结果已公布，您排名第12位。' },
  { type: 'reminder', title: '月末数据确认提醒', content: '本月数据截止日期为3月28日，请确认您的使用数据。' },
  { type: 'achievement', title: '进步之星', content: '您本月评分较上月提升15分，获得进步之星称号！' },
  { type: 'system', title: '新增AI工具通知', content: '公司新增DeepSeek工具，已添加到评估范围。' },
];

export const notifications: Notification[] = members.slice(0, 10).flatMap((m, mi) =>
  notifTemplates.map((t, ti) => ({
    id: `n${mi * 10 + ti + 1}`,
    ...t,
    date: `2026-03-${String(Math.floor(rand() * 18) + 1).padStart(2, '0')}`,
    read: rand() > 0.5,
    memberId: m.id,
  }))
);
