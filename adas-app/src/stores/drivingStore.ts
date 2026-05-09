import { create } from 'zustand';
import { DrivingStats, DrivingEvent, EventType } from '@/types';

interface DrivingStore {
  stats: DrivingStats;
  addEvent: (type: EventType, details?: { speed?: number; location?: string }) => void;
  resetStats: () => void;
  updateFromADAS: (adasTime: number, distance: number) => void;
}

const initialStats: DrivingStats = {
  totalDistance: 0,
  totalTime: 0,
  adasTime: 0,
  takeoverCount: 0,
  safetyScore: 100,
  events: [],
};

const generateId = () => Math.random().toString(36).substring(2, 15);

export const useDrivingStore = create<DrivingStore>((set, get) => ({
  stats: initialStats,

  addEvent: (type: EventType, details?: { speed?: number; location?: string }) => {
    const event: DrivingEvent = {
      id: generateId(),
      type,
      timestamp: Date.now(),
      details: details || {},
    };

    set((state) => {
      const newEvents = [event, ...state.stats.events].slice(0, 100);
      const scoreDelta = type === 'hard_brake' ? -10 : 
                         type === 'rapid_acceleration' ? -5 : 
                         type === 'takeover' ? -15 : 
                         type === 'speeding' ? -20 : -2;
      const newScore = Math.max(0, Math.min(100, state.stats.safetyScore + scoreDelta));

      return {
        stats: {
          ...state.stats,
          events: newEvents,
          safetyScore: newScore,
          takeoverCount: type === 'takeover' ? state.stats.takeoverCount + 1 : state.stats.takeoverCount,
        },
      };
    });
  },

  resetStats: () => set({ stats: initialStats }),

  updateFromADAS: (adasTime: number, distance: number) => set((state) => ({
    stats: {
      ...state.stats,
      adasTime: state.stats.adasTime + adasTime,
      totalDistance: state.stats.totalDistance + distance,
      totalTime: state.stats.totalTime + 1,
    },
  })),
}));