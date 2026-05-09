import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  if (hours > 0) {
    return `${hours}小时${minutes}分钟`;
  }
  if (minutes > 0) {
    return `${minutes}分${secs}秒`;
  }
  return `${secs}秒`;
}

export function formatDistance(km: number): string {
  if (km >= 1) {
    return `${km.toFixed(1)} km`;
  }
  return `${Math.round(km * 1000)} m`;
}

export function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function getScoreColor(score: number): string {
  if (score >= 90) return 'text-green-500';
  if (score >= 70) return 'text-yellow-500';
  return 'text-red-500';
}

export function getEventLabel(type: string): string {
  const labels: Record<string, string> = {
    hard_brake: '急刹车',
    rapid_acceleration: '急加速',
    lane_change: '变道',
    speeding: '超速',
    takeover: '接管',
  };
  return labels[type] || type;
}

export function getModeLabel(mode: string): string {
  const labels: Record<string, string> = {
    NOA: '高速导航辅助驾驶',
    LCC: '车道居中保持',
    ACC: '自适应巡航',
    APA: '自动泊车',
    OFF: '智驾关闭',
  };
  return labels[mode] || mode;
}

export function getJudgmentLabel(status: string): { label: string; color: string } {
  const map: Record<string, { label: string; color: string }> = {
    pending: { label: '待判定', color: 'bg-gray-500' },
    adas_accident: { label: '智驾事故', color: 'bg-blue-500' },
    normal_accident: { label: '普通事故', color: 'bg-orange-500' },
    unclear: { label: '无法判定', color: 'bg-yellow-500' },
  };
  return map[status] || { label: status, color: 'bg-gray-500' };
}