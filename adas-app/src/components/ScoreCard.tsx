import { cn } from '@/utils/helpers';
import { Shield, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface ScoreCardProps {
  score: number;
  previousScore?: number;
  label?: string;
  className?: string;
}

export function ScoreCard({ score, previousScore, label = '安全评分', className }: ScoreCardProps) {
  const getTrend = () => {
    if (!previousScore) return null;
    const diff = score - previousScore;
    if (diff > 0) return { icon: TrendingUp, color: 'text-green-500', label: `+${diff}` };
    if (diff < 0) return { icon: TrendingDown, color: 'text-red-500', label: `${diff}` };
    return { icon: Minus, color: 'text-gray-500', label: '0' };
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'from-green-500 to-emerald-600';
    if (score >= 70) return 'from-yellow-500 to-orange-600';
    return 'from-red-500 to-red-700';
  };

  const getScoreGradient = (score: number) => {
    if (score >= 90) return 'text-green-500';
    if (score >= 70) return 'text-yellow-500';
    return 'text-red-500';
  };

  const trend = getTrend();

  return (
    <div className={cn('bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 border border-gray-700', className)}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-adas-blue" />
          <span className="text-gray-400 text-sm">{label}</span>
        </div>
        {trend && (
          <div className={cn('flex items-center gap-1 text-sm', trend.color)}>
            <trend.icon className="w-4 h-4" />
            <span>{trend.label}</span>
          </div>
        )}
      </div>

      <div className="relative flex items-center justify-center mb-4">
        <div className="w-32 h-32 relative">
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="64"
              cy="64"
              r="56"
              stroke="currentColor"
              strokeWidth="8"
              fill="none"
              className="text-gray-700"
            />
            <circle
              cx="64"
              cy="64"
              r="56"
              stroke="url(#scoreGradient)"
              strokeWidth="8"
              fill="none"
              strokeLinecap="round"
              strokeDasharray={351.86}
              strokeDashoffset={351.86 - (351.86 * score) / 100}
              className="transition-all duration-1000"
            />
            <defs>
              <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" className={getScoreColor(score).split(' ')[0]} />
                <stop offset="100%" className={getScoreColor(score).split(' ')[1]} />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className={cn('text-4xl font-bold', getScoreGradient(score))}>
              {score}
            </span>
          </div>
        </div>
      </div>

      <div className="flex justify-center gap-2">
        <span className={cn(
          'px-3 py-1 rounded-full text-xs font-medium',
          score >= 90 ? 'bg-green-500/20 text-green-400' :
          score >= 70 ? 'bg-yellow-500/20 text-yellow-400' :
          'bg-red-500/20 text-red-400'
        )}>
          {score >= 90 ? '优秀' : score >= 70 ? '良好' : '需要改进'}
        </span>
      </div>
    </div>
  );
}