'use client';

import { cn, calculateLevel } from '@/lib/utils';
import { Card, CardContent } from './Card';
import { CircularProgress } from './ProgressBar';

interface UserProfileCardProps {
  name: string;
  avatar?: string;
  level: number;
  xp: number;
  streak: number;
  condition: string;
  className?: string;
}

export function UserProfileCard({
  name,
  avatar,
  level,
  xp,
  streak,
  condition,
  className,
}: UserProfileCardProps) {
  const { currentXp, xpToNext } = calculateLevel(xp);
  const xpPercentage = (currentXp / xpToNext) * 100;

  const conditionLabels: Record<string, string> = {
    knee_replacement: '膝关节置换术后',
    acl_reconstruction: 'ACL重建术后',
    shoulder_surgery: '肩部手术术后',
    hip_replacement: '髋关节置换术后',
    ankle_sprain: '踝关节扭伤',
    back_pain: '腰背疼痛',
    sports_injury: '运动损伤',
  };

  return (
    <Card className={cn('overflow-hidden', className)}>
      <div className="bg-gradient-to-r from-blue-500 to-green-500 h-20" />
      <CardContent className="-mt-10 relative">
        <div className="flex items-end gap-4">
          <div className="w-20 h-20 rounded-2xl bg-white border-4 border-white shadow-lg flex items-center justify-center text-3xl">
            {avatar || '👤'}
          </div>
          <div className="flex-1 pb-1">
            <h2 className="text-xl font-bold text-gray-900">{name}</h2>
            <p className="text-sm text-gray-500">{conditionLabels[condition] || condition}</p>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{level}</div>
            <div className="text-xs text-gray-500 mt-1">等级</div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1">
              <span className="text-2xl font-bold text-orange-500">{streak}</span>
              <span className="text-lg">🔥</span>
            </div>
            <div className="text-xs text-gray-500 mt-1">连续天数</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{xp}</div>
            <div className="text-xs text-gray-500 mt-1">总经验值</div>
          </div>
        </div>

        <div className="mt-4">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>升级进度</span>
            <span>{currentXp} / {xpToNext} XP</span>
          </div>
          <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-green-500 rounded-full transition-all duration-500"
              style={{ width: `${xpPercentage}%` }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface StatCardProps {
  icon: string;
  label: string;
  value: string | number;
  change?: number;
  color?: string;
  className?: string;
}

export function StatCard({ icon, label, value, change, color = 'blue', className }: StatCardProps) {
  const colorClasses: Record<string, string> = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    orange: 'from-orange-500 to-orange-600',
    purple: 'from-purple-500 to-purple-600',
    red: 'from-red-500 to-red-600',
  };

  return (
    <Card className={cn('p-5', className)}>
      <div className="flex items-start justify-between">
        <div className={cn('w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center text-2xl', colorClasses[color])}>
          {icon}
        </div>
        {change !== undefined && (
          <span className={cn(
            'text-xs font-medium px-2 py-1 rounded-full',
            change >= 0 ? 'text-green-700 bg-green-50' : 'text-red-700 bg-red-50'
          )}>
            {change >= 0 ? '+' : ''}{change}%
          </span>
        )}
      </div>
      <div className="mt-4">
        <div className="text-2xl font-bold text-gray-900">{value}</div>
        <div className="text-sm text-gray-500 mt-1">{label}</div>
      </div>
    </Card>
  );
}
