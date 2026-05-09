export type Grade = 'S' | 'A' | 'B' | 'C' | 'D';

export interface Member {
  id: string;
  name: string;
  avatar: string;
  department: string;
  teamId: string;
  role: string;
  joinDate: string;
}

export interface Team {
  id: string;
  name: string;
  leaderId: string;
  memberIds: string[];
}

export interface AITool {
  id: string;
  name: string;
  category: string;
  description: string;
  enabled: boolean;
}

export interface UsageRecord {
  id: string;
  memberId: string;
  toolId: string;
  date: string;
  scenario: string;
  duration: number; // minutes
  output: string;
  selfRating: number; // 1-5
  shared: boolean;
}

export interface DimensionScore {
  frequency: number;    // 频率 0-100
  depth: number;        // 深度 0-100
  output: number;       // 产出 0-100
  contribution: number; // 贡献 0-100
}

export interface MonthlyScore {
  memberId: string;
  month: string; // YYYY-MM
  dimensions: DimensionScore;
  totalScore: number;
  grade: Grade;
  rank: number;
  toolUsage: Record<string, number>; // toolId -> count
}

export interface Notification {
  id: string;
  type: 'score_result' | 'reminder' | 'achievement' | 'system';
  title: string;
  content: string;
  date: string;
  read: boolean;
  memberId: string;
}

export interface ScoringRule {
  id: string;
  name: string;
  weights: {
    frequency: number;
    depth: number;
    output: number;
    contribution: number;
  };
  gradeThresholds: Record<Grade, number>;
}
