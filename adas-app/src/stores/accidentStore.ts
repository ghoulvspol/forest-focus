import { create } from 'zustand';
import { AccidentCase, ADASStatus, JudgmentResult } from '@/types';

interface AccidentStore {
  cases: AccidentCase[];
  currentCase: AccidentCase | null;
  addCase: (caseData: Partial<AccidentCase>) => void;
  setCurrentCase: (caseData: AccidentCase | null) => void;
  judgeCase: (caseId: string) => void;
  deleteCase: (id: string) => void;
}

const generateId = () => Math.random().toString(36).substring(2, 15);

export const useAccidentStore = create<AccidentStore>((set, get) => ({
  cases: [],

  currentCase: null,

  addCase: (caseData: Partial<AccidentCase>) => {
    const newCase: AccidentCase = {
      id: generateId(),
      timestamp: Date.now(),
      adasStatus: caseData.adasStatus || {
        mode: 'OFF',
        isActive: false,
        speed: 0,
        laneKeep: false,
        followDistance: 3,
        speedLimit: 120,
        activeTime: 0,
      },
      vehicleData: caseData.vehicleData || {
        speed: 0,
        brakeStatus: 'none',
        steeringAngle: 0,
      },
      judgment: 'pending',
    };
    set((state) => ({ cases: [newCase, ...state.cases].slice(0, 100) }));
  },

  setCurrentCase: (caseData: AccidentCase | null) => set({ currentCase: caseData }),

  judgeCase: (caseId: string) => {
    const targetCase = get().cases.find((c) => c.id === caseId);
    if (!targetCase) return;

    const { adasStatus, vehicleData } = targetCase;
    
    let judgment: JudgmentResult;
    let result: string;

    const hasAccident = vehicleData.brakeStatus === 'hard' && vehicleData.speed > 10;
    
    if (!hasAccident) {
      judgment = 'unclear';
      result = '无法判定：未检测到明显事故特征';
    } else if (adasStatus.isActive && adasStatus.mode !== 'OFF') {
      judgment = 'adas_accident';
      result = '智驾事故：事故发生时智驾功能开启，系统将承担相应责任';
    } else {
      judgment = 'normal_accident';
      result = '普通事故：智驾未开启，按普通车险理赔';
    }

    set((state) => ({
      cases: state.cases.map((c) =>
        c.id === caseId
          ? { ...c, judgment, judgmentTime: Date.now(), result }
          : c
      ),
    }));
  },

  deleteCase: (id: string) => set((state) => ({
    cases: state.cases.filter((c) => c.id !== id),
  })),
}));

export const createTestCase = (adasStatus: ADASStatus): Partial<AccidentCase> => {
  const speed = Math.floor(Math.random() * 80 + 20);
  const brakeStatus = Math.random() > 0.7 ? 'hard' : Math.random() > 0.5 ? 'normal' : 'none';
  
  return {
    adasStatus,
    vehicleData: {
      speed,
      brakeStatus,
      steeringAngle: Math.random() * 30 - 15,
    },
  };
};