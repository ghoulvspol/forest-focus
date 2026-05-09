export type ADASMode = 'NOA' | 'LCC' | 'ACC' | 'APA' | 'OFF';

export interface ADASStatus {
  mode: ADASMode;
  isActive: boolean;
  speed: number;
  laneKeep: boolean;
  followDistance: number;
  speedLimit: number;
  activeTime: number;
}

export type EventType = 'hard_brake' | 'rapid_acceleration' | 'lane_change' | 'speeding' | 'takeover';

export interface DrivingEvent {
  id: string;
  type: EventType;
  timestamp: number;
  details: {
    speed?: number;
    location?: string;
  };
}

export interface DrivingStats {
  totalDistance: number;
  totalTime: number;
  adasTime: number;
  takeoverCount: number;
  safetyScore: number;
  events: DrivingEvent[];
}

export type JudgmentResult = 'pending' | 'adas_accident' | 'normal_accident' | 'unclear';

export interface AccidentCase {
  id: string;
  timestamp: number;
  adasStatus: ADASStatus;
  vehicleData: {
    speed: number;
    brakeStatus: string;
    steeringAngle: number;
  };
  judgment: JudgmentResult;
  judgmentTime?: number;
  result?: string;
}

export type ReportPeriod = 'daily' | 'weekly' | 'monthly';

export interface DrivingReport {
  id: string;
  date: string;
  period: ReportPeriod;
  summary: {
    totalDistance: number;
    totalTime: number;
    adasCoverage: number;
    safetyScore: number;
  };
  details: {
    events: DrivingEvent[];
    scores: number[];
    recommendations: string[];
  };
}

export interface NavItem {
  name: string;
  href: string;
  icon: string;
}