import { create } from 'zustand';
import type { Member, MonthlyScore, Notification, UsageRecord, AITool, ScoringRule } from '../types';
import { members as mockMembers } from '../mock/members';
import { monthlyScores as mockScores, notifications as mockNotifs, usageRecords as mockRecords } from '../mock/scores';
import { teams as mockTeams, aiTools as mockTools } from '../mock/teams';
import { DEFAULT_WEIGHTS, DEFAULT_THRESHOLDS } from '../utils/scoring';
import type { Team } from '../types';

interface AppState {
  currentUserId: string;
  members: Member[];
  teams: Team[];
  aiTools: AITool[];
  monthlyScores: MonthlyScore[];
  notifications: Notification[];
  usageRecords: UsageRecord[];
  scoringRule: ScoringRule;

  setCurrentUser: (id: string) => void;
  addMember: (m: Member) => void;
  updateMember: (id: string, data: Partial<Member>) => void;
  deleteMember: (id: string) => void;
  addUsageRecord: (r: UsageRecord) => void;
  markNotificationRead: (id: string) => void;
  markAllRead: () => void;
  updateScoringRule: (rule: Partial<ScoringRule>) => void;
  addAITool: (tool: AITool) => void;
  updateAITool: (id: string, data: Partial<AITool>) => void;
  deleteAITool: (id: string) => void;
}

export const useStore = create<AppState>((set) => ({
  currentUserId: 'm1',
  members: mockMembers,
  teams: mockTeams,
  aiTools: mockTools,
  monthlyScores: mockScores,
  notifications: mockNotifs,
  usageRecords: mockRecords,
  scoringRule: {
    id: 'rule1',
    name: '默认考核规则',
    weights: { ...DEFAULT_WEIGHTS },
    gradeThresholds: { ...DEFAULT_THRESHOLDS },
  },

  setCurrentUser: (id) => set({ currentUserId: id }),

  addMember: (m) => set((s) => ({ members: [...s.members, m] })),

  updateMember: (id, data) => set((s) => ({
    members: s.members.map((m) => m.id === id ? { ...m, ...data } : m),
  })),

  deleteMember: (id) => set((s) => ({
    members: s.members.filter((m) => m.id !== id),
  })),

  addUsageRecord: (r) => set((s) => ({
    usageRecords: [r, ...s.usageRecords],
  })),

  markNotificationRead: (id) => set((s) => ({
    notifications: s.notifications.map((n) => n.id === id ? { ...n, read: true } : n),
  })),

  markAllRead: () => set((s) => ({
    notifications: s.notifications.map((n) => ({ ...n, read: true })),
  })),

  updateScoringRule: (rule) => set((s) => ({
    scoringRule: { ...s.scoringRule, ...rule },
  })),

  addAITool: (tool) => set((s) => ({ aiTools: [...s.aiTools, tool] })),

  updateAITool: (id, data) => set((s) => ({
    aiTools: s.aiTools.map((t) => t.id === id ? { ...t, ...data } : t),
  })),

  deleteAITool: (id) => set((s) => ({
    aiTools: s.aiTools.filter((t) => t.id !== id),
  })),
}));
