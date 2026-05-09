import { cn } from '@/utils/helpers';
import { ADASStatus } from '@/types';
import { getModeLabel } from '@/utils/helpers';
import { Car, Gauge, MapPin, Navigation, ParkingCircle } from 'lucide-react';

interface ADASStatusProps {
  status: ADASStatus;
  className?: string;
}

export function ADASStatusCard({ status, className }: ADASStatusProps) {
  const getModeIcon = () => {
    switch (status.mode) {
      case 'NOA':
        return <Navigation className="w-8 h-8" />;
      case 'LCC':
      case 'ACC':
        return <Car className="w-8 h-8" />;
      case 'APA':
        return <ParkingCircle className="w-8 h-8" />;
      default:
        return <Gauge className="w-8 h-8" />;
    }
  };

  return (
    <div className={cn('bg-gradient-to-br from-adas-dark to-gray-900 rounded-2xl p-6 border border-gray-800', className)}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className={cn(
            'p-3 rounded-xl',
            status.isActive ? 'bg-adas-blue/20 text-adas-blue' : 'bg-gray-800 text-gray-500'
          )}>
            {getModeIcon()}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">{getModeLabel(status.mode)}</h3>
            <p className="text-sm text-gray-400">
              {status.isActive ? '功能已启用' : '功能未启用'}
            </p>
          </div>
        </div>
        <div className={cn(
          'px-4 py-2 rounded-full text-sm font-medium',
          status.isActive ? 'bg-adas-green/20 text-adas-green' : 'bg-gray-800 text-gray-500'
        )}>
          {status.isActive ? '工作中' : '待机中'}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gray-800/50 rounded-xl p-4">
          <div className="flex items-center gap-2 text-gray-400 mb-2">
            <Gauge className="w-4 h-4" />
            <span className="text-sm">当前速度</span>
          </div>
          <div className="text-2xl font-bold text-white">
            {status.speed} <span className="text-lg text-gray-400">km/h</span>
          </div>
        </div>

        <div className="bg-gray-800/50 rounded-xl p-4">
          <div className="flex items-center gap-2 text-gray-400 mb-2">
            <Navigation className="w-4 h-4" />
            <span className="text-sm">限速</span>
          </div>
          <div className="text-2xl font-bold text-white">
            {status.speedLimit} <span className="text-lg text-gray-400">km/h</span>
          </div>
        </div>

        <div className="bg-gray-800/50 rounded-xl p-4">
          <div className="flex items-center gap-2 text-gray-400 mb-2">
            <MapPin className="w-4 h-4" />
            <span className="text-sm">跟车距离</span>
          </div>
          <div className="text-2xl font-bold text-white">
            {status.followDistance} <span className="text-lg text-gray-400">档</span>
          </div>
        </div>

        <div className="bg-gray-800/50 rounded-xl p-4">
          <div className="flex items-center gap-2 text-gray-400 mb-2">
            <Car className="w-4 h-4" />
            <span className="text-sm">车道保持</span>
          </div>
          <div className={cn(
            'text-2xl font-bold',
            status.laneKeep ? 'text-adas-green' : 'text-adas-red'
          )}>
            {status.laneKeep ? '正常' : '偏离'}
          </div>
        </div>
      </div>
    </div>
  );
}