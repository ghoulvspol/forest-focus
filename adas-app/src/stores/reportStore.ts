import { create } from 'zustand';
import { DrivingReport, ReportPeriod } from '@/types';

interface ReportStore {
  reports: DrivingReport[];
  currentReport: DrivingReport | null;
  addReport: (report: DrivingReport) => void;
  setCurrentReport: (report: DrivingReport | null) => void;
  deleteReport: (id: string) => void;
}

const generateId = () => Math.random().toString(36).substring(2, 15);

export const useReportStore = create<ReportStore>((set) => ({
  reports: [],

  currentReport: null,

  addReport: (report: DrivingReport) => set((state) => ({
    reports: [report, ...state.reports].slice(0, 50),
  })),

  setCurrentReport: (report: DrivingReport | null) => set({ currentReport: report }),

  deleteReport: (id: string) => set((state) => ({
    reports: state.reports.filter((r) => r.id !== id),
  })),
}));

export const generateReport = (period: ReportPeriod): DrivingReport => {
  const now = new Date();
  const periods = {
    daily: 1,
    weekly: 7,
    monthly: 30,
  };
  
  const days = periods[period];
  const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
  
  const totalDistance = Math.floor(Math.random() * 500 + 100) * days;
  const totalTime = Math.floor(totalDistance / 60);
  const adasTime = Math.floor(totalTime * (0.5 + Math.random() * 0.3));
  const adasCoverage = Math.round((adasTime / totalTime) * 100);
  const safetyScore = Math.floor(Math.random() * 20 + 80);
  
  const recommendations = [
    '保持安全跟车距离，建议与前车保持3秒以上距离',
    '避免频繁变道，减少潜在风险',
    '使用NOA时注意观察周围环境，随时准备接管',
    '泊车时注意盲区，确保安全后再执行',
  ];
  
  return {
    id: generateId(),
    date: startDate.toISOString().split('T')[0],
    period,
    summary: {
      totalDistance,
      totalTime,
      adasCoverage,
      safetyScore,
    },
    details: {
      events: [],
      scores: Array.from({ length: days }, () => Math.floor(Math.random() * 20 + 80)),
      recommendations: recommendations.slice(0, 2 + Math.floor(Math.random() * 2)),
    },
  };
};