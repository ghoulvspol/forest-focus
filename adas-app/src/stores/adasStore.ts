import { create } from 'zustand';
import { ADASStatus, ADASMode } from '@/types';

interface ADASStore {
  status: ADASStatus;
  setMode: (mode: ADASMode) => void;
  toggle: () => void;
  setSpeed: (speed: number) => void;
  setLaneKeep: (keep: boolean) => void;
  setFollowDistance: (distance: number) => void;
  updateActiveTime: () => void;
}

const initialStatus: ADASStatus = {
  mode: 'OFF',
  isActive: false,
  speed: 0,
  laneKeep: false,
  followDistance: 3,
  speedLimit: 120,
  activeTime: 0,
};

export const useADASStore = create<ADASStore>((set, get) => ({
  status: initialStatus,

  setMode: (mode: ADASMode) => set((state) => ({
    status: {
      ...state.status,
      mode,
      isActive: mode !== 'OFF',
      activeTime: mode !== 'OFF' ? state.status.activeTime : 0,
    },
  })),

  toggle: () => set((state) => {
    const newActive = !state.status.isActive;
    return {
      status: {
        ...state.status,
        isActive: newActive,
        mode: newActive ? 'LCC' : 'OFF',
        activeTime: newActive ? state.status.activeTime : 0,
      },
    };
  }),

  setSpeed: (speed: number) => set((state) => ({
    status: { ...state.status, speed },
  })),

  setLaneKeep: (keep: boolean) => set((state) => ({
    status: { ...state.status, laneKeep: keep },
  })),

  setFollowDistance: (distance: number) => set((state) => ({
    status: { ...state.status, followDistance: distance },
  })),

  updateActiveTime: () => set((state) => ({
    status: {
      ...state.status,
      activeTime: state.status.isActive ? state.status.activeTime + 1 : 0,
    },
  })),
}));