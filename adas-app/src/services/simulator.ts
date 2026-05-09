import { ADASStatus, ADASMode, DrivingEvent } from '@/types';

const MODES: ADASMode[] = ['OFF', 'LCC', 'ACC', 'NOA', 'APA'];

export class ADASSimulator {
  private intervalId: NodeJS.Timeout | null = null;
  private status: ADASStatus;
  private onUpdate: (status: ADASStatus, events: DrivingEvent[]) => void;

  constructor(onUpdate: (status: ADASStatus, events: DrivingEvent[]) => void) {
    this.status = {
      mode: 'OFF',
      isActive: false,
      speed: 0,
      laneKeep: false,
      followDistance: 3,
      speedLimit: 120,
      activeTime: 0,
    };
    this.onUpdate = onUpdate;
  }

  start() {
    if (this.intervalId) return;
    
    this.intervalId = setInterval(() => {
      this.update();
    }, 1000);
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  private update() {
    const events: DrivingEvent[] = [];

    if (Math.random() > 0.95) {
      const modes = ['OFF', 'LCC', 'ACC', 'NOA'];
      const newMode = modes[Math.floor(Math.random() * modes.length)];
      this.status.mode = newMode as ADASMode;
      this.status.isActive = newMode !== 'OFF';
    }

    if (this.status.isActive) {
      if (Math.random() > 0.7) {
        this.status.speed = Math.min(180, Math.max(0, this.status.speed + (Math.random() > 0.5 ? 5 : -5)));
      }

      if (this.status.speed > this.status.speedLimit) {
        events.push({
          id: Math.random().toString(36).substring(2, 15),
          type: 'speeding',
          timestamp: Date.now(),
          details: { speed: this.status.speed },
        });
      }

      if (Math.random() > 0.98) {
        events.push({
          id: Math.random().toString(36).substring(2, 15),
          type: 'hard_brake',
          timestamp: Date.now(),
          details: { speed: this.status.speed },
        });
      }

      if (Math.random() > 0.97) {
        events.push({
          id: Math.random().toString(36).substring(2, 15),
          type: 'rapid_acceleration',
          timestamp: Date.now(),
          details: { speed: this.status.speed },
        });
      }

      if (Math.random() > 0.95) {
        events.push({
          id: Math.random().toString(36).substring(2, 15),
          type: 'takeover',
          timestamp: Date.now(),
        });
      }

      this.status.activeTime += 1;
      this.status.laneKeep = Math.random() > 0.1;
    }

    this.onUpdate({ ...this.status }, events);
  }

  setMode(mode: ADASMode) {
    this.status.mode = mode;
    this.status.isActive = mode !== 'OFF';
  }

  getStatus(): ADASStatus {
    return { ...this.status };
  }
}

export const createADASSimulator = (onUpdate: (status: ADASStatus, events: DrivingEvent[]) => void) => {
  return new ADASSimulator(onUpdate);
};