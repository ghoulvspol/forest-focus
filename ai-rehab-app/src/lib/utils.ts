import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function getConditionLabel(condition: string): string {
  const labels: Record<string, string> = {
    knee_replacement: '膝关节置换术后',
    acl_reconstruction: 'ACL重建术后',
    shoulder_surgery: '肩部手术术后',
    hip_replacement: '髋关节置换术后',
    ankle_sprain: '踝关节扭伤',
    back_pain: '腰背疼痛',
    sports_injury: '运动损伤',
  };
  return labels[condition] || condition;
}

export function getDifficultyColor(difficulty: string): string {
  switch (difficulty) {
    case 'beginner': return 'text-green-600 bg-green-50';
    case 'intermediate': return 'text-yellow-600 bg-yellow-50';
    case 'advanced': return 'text-red-600 bg-red-50';
    default: return 'text-gray-600 bg-gray-50';
  }
}

export function getDifficultyLabel(difficulty: string): string {
  switch (difficulty) {
    case 'beginner': return '初级';
    case 'intermediate': return '中级';
    case 'advanced': return '高级';
    default: return difficulty;
  }
}

export function getRarityColor(rarity: string): string {
  switch (rarity) {
    case 'common': return 'from-gray-400 to-gray-500';
    case 'rare': return 'from-blue-400 to-blue-600';
    case 'epic': return 'from-purple-400 to-purple-600';
    case 'legendary': return 'from-yellow-400 to-orange-500';
    default: return 'from-gray-400 to-gray-500';
  }
}

export function calculateLevel(xp: number): { level: number; currentXp: number; xpToNext: number } {
  const baseXp = 100;
  const growthFactor = 1.5;
  let level = 1;
  let totalXpNeeded = 0;
  let xpForCurrentLevel = baseXp;

  while (totalXpNeeded + xpForCurrentLevel <= xp) {
    totalXpNeeded += xpForCurrentLevel;
    level++;
    xpForCurrentLevel = Math.floor(baseXp * Math.pow(growthFactor, level - 1));
  }

  return {
    level,
    currentXp: xp - totalXpNeeded,
    xpToNext: xpForCurrentLevel,
  };
}
