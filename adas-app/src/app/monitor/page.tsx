'use client';

'use client';

import { useState, useEffect, useRef } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { ADASStatusCard } from '@/components/ADASStatusCard';
import { useADASStore } from '@/stores/adasStore';
import { createADASSimulator } from '@/services/simulator';
import { ADASMode } from '@/types';
import { 
  Play, 
  Pause, 
  Gauge, 
  Navigation, 
  MapPin, 
  Car, 
  Clock,
  Activity
} from 'lucide-react';

const modes: { mode: ADASMode; label: string; desc: string }[] = [
  { mode: 'NOA', label: 'NOA', desc: '高速导航辅助驾驶' },
  { mode: 'LCC', label: 'LCC', desc: '车道居中保持' },
  { mode: 'ACC', label: 'ACC', desc: '自适应巡航' },
  { mode: 'APA', label: 'APA', desc: '自动泊车' },
  { mode: 'OFF', label: '关闭', desc: '智驾功能关闭' },
];

export default function MonitorPage() {
  const { status, setMode, setSpeed, setLaneKeep, setFollowDistance, updateActiveTime } = useADASStore();
  const [isRunning, setIsRunning] = useState(false);
  const simulatorRef = useRef<ReturnType<typeof createADASSimulator> | null>(null);

  useEffect(() => {
    if (isRunning && !simulatorRef.current) {
      simulatorRef.current = createADASSimulator((newStatus, _) => {
        setSpeed(newStatus.speed);
        setLaneKeep(newStatus.laneKeep);
        updateActiveTime();
      });
      simulatorRef.current.start();
    } else if (!isRunning && simulatorRef.current) {
      simulatorRef.current.stop();
      simulatorRef.current = null;
    }

    return () => {
      if (simulatorRef.current) {
        simulatorRef.current.stop();
      }
    };
  }, [isRunning, setSpeed, setLaneKeep, updateActiveTime]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <Sidebar />
      
      <main className="flex-1 p-8 overflow-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">智驾监控</h1>
          <p className="text-gray-400">实时监控智驾系统状态和运行参数</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <ADASStatusCard status={status} />

          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-adas-blue" />
              模式选择
            </h3>
            
            <div className="grid grid-cols-5 gap-2 mb-6">
              {modes.map((m) => (
                <button
                  key={m.mode}
                  onClick={() => setMode(m.mode)}
                  className={`p-3 rounded-xl text-center transition-all ${
                    status.mode === m.mode
                      ? 'bg-adas-blue text-white border-2 border-adas-blue'
                      : 'bg-gray-800 text-gray-400 hover:bg-gray-700 border-2 border-transparent'
                  }`}
                >
                  <div className="font-bold text-sm">{m.label}</div>
                  <div className="text-xs opacity-70 mt-1">{m.desc}</div>
                </button>
              ))}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setIsRunning(!isRunning)}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-medium transition-all ${
                  isRunning
                    ? 'bg-adas-orange/20 text-adas-orange border border-adas-orange/30'
                    : 'bg-adas-green/20 text-adas-green border border-adas-green/30 hover:bg-adas-green/30'
                }`}
              >
                {isRunning ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                {isRunning ? '暂停模拟' : '开始模拟'}
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 border border-gray-700">
            <div className="flex items-center gap-2 mb-4">
              <Gauge className="w-5 h-5 text-adas-blue" />
              <span className="text-gray-400 text-sm">速度控制</span>
            </div>
            <div className="space-y-4">
              <input
                type="range"
                min="0"
                max="180"
                value={status.speed}
                onChange={(e) => setSpeed(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">0 km/h</span>
                <span className="text-white font-semibold">{status.speed} km/h</span>
                <span className="text-gray-500">180 km/h</span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 border border-gray-700">
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="w-5 h-5 text-adas-blue" />
              <span className="text-gray-400 text-sm">跟车距离</span>
            </div>
            <div className="space-y-4">
              <input
                type="range"
                min="1"
                max="5"
                value={status.followDistance}
                onChange={(e) => setFollowDistance(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">最近</span>
                <span className="text-white font-semibold">{status.followDistance} 档</span>
                <span className="text-gray-500">最远</span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 border border-gray-700">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-5 h-5 text-adas-orange" />
              <span className="text-gray-400 text-sm">智驾时长</span>
            </div>
            <div className="text-4xl font-bold text-white text-center">
              {formatTime(status.activeTime)}
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Car className="w-5 h-5 text-adas-blue" />
            实时数据面板
          </h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gray-800/50 rounded-xl p-4 text-center">
              <div className="text-gray-400 text-sm mb-2">当前速度</div>
              <div className="text-2xl font-bold text-white">{status.speed} <span className="text-sm text-gray-500">km/h</span></div>
            </div>
            <div className="bg-gray-800/50 rounded-xl p-4 text-center">
              <div className="text-gray-400 text-sm mb-2">限速</div>
              <div className="text-2xl font-bold text-white">{status.speedLimit} <span className="text-sm text-gray-500">km/h</span></div>
            </div>
            <div className="bg-gray-800/50 rounded-xl p-4 text-center">
              <div className="text-gray-400 text-sm mb-2">车道保持</div>
              <div className={`text-2xl font-bold ${status.laneKeep ? 'text-adas-green' : 'text-adas-red'}`}>
                {status.laneKeep ? '正常' : '偏离'}
              </div>
            </div>
            <div className="bg-gray-800/50 rounded-xl p-4 text-center">
              <div className="text-gray-400 text-sm mb-2">智驾状态</div>
              <div className={`text-2xl font-bold ${status.isActive ? 'text-adas-blue' : 'text-gray-500'}`}>
                {status.isActive ? '启用' : '关闭'}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}