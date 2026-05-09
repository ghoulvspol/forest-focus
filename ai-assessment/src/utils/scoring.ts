import type { DimensionScore, Grade } from '../types';

// 默认权重
export const DEFAULT_WEIGHTS = {
  frequency: 0.25,
  depth: 0.30,
  output: 0.30,
  contribution: 0.15,
};

// 等级阈值
export const DEFAULT_THRESHOLDS: Record<Grade, number> = {
  S: 90,
  A: 75,
  B: 60,
  C: 40,
  D: 0,
};

export function calculateTotalScore(
  dimensions: DimensionScore,
  weights = DEFAULT_WEIGHTS,
): number {
  const score =
    dimensions.frequency * weights.frequency +
    dimensions.depth * weights.depth +
    dimensions.output * weights.output +
    dimensions.contribution * weights.contribution;
  return Math.round(score * 10) / 10;
}

export function calculateGrade(
  totalScore: number,
  thresholds = DEFAULT_THRESHOLDS,
): Grade {
  if (totalScore >= thresholds.S) return 'S';
  if (totalScore >= thresholds.A) return 'A';
  if (totalScore >= thresholds.B) return 'B';
  if (totalScore >= thresholds.C) return 'C';
  return 'D';
}

export const GRADE_COLORS: Record<Grade, string> = {
  S: '#f5222d',
  A: '#fa8c16',
  B: '#52c41a',
  C: '#1890ff',
  D: '#8c8c8c',
};

export const DIMENSION_LABELS: Record<keyof DimensionScore, string> = {
  frequency: '使用频率',
  depth: '使用深度',
  output: '工作产出',
  contribution: '分享贡献',
};
