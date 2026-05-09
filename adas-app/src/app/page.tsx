'use client';

import { useState, useEffect, useRef } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { ScoreCard } from '@/components/ScoreCard';
import { ADASStatusCard } from '@/components/ADASStatusCard';
import { useADASStore } from '@/stores/adasStore';
import { useDrivingStore } from '@/stores/drivingStore';
import { createADASSimulator } from '@/services/simulator';
import { formatTime, formatDistance } from '@/utils/helpers';
import { ADASMode } from '@/types';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Zap, 
  Clock, 
  Route, 
  Gauge,
  ArrowUp,
  ArrowDown,
  MoveHorizontal,
  AlertTriangle
} from 'lucide-react';

const modes: ADASMode[] = ['OFF', 'LCC', 'ACC', 'NOA', 'APA'];

export default function Dashboard() {
  const { status, setMode, toggle, setSpeed } = useADASStore();
  const { stats, addEvent, updateFromADAS } = useDrivingStore();
  const [isRunning, setIsRunning] = useState(false);
  const simulatorRef = useRef<ReturnType<typeof createADASSimulator> | null>(null);

  useEffect(() => {
    if (isRunning && !simulatorRef.current) {
      simulatorRef.current = createADASSimulator((newStatus, events) => {
        setSpeed(newStatus.speed);
        events.forEach(event => addEvent(event.type, event.details));
        if (newStatus.isActive) {
          updateFromADAS(1, newStatus.speed / 3600);
        }
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
  }, [isRunning, addEvent, updateFromADAS, setSpeed]);

  const adasCoverage = stats.totalTime > 0 
    ? Math.round((stats.adasTime / stats.totalTime) * 100) 
    : 0;

  const recentEvents = stats.events.slice(0, 5);

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <Sidebar />
      
      <main className="flex-1 p-8 overflow-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">仪表盘</h1>
          <p className="text-gray-400">实时监控智驾状态，查看驾驶数据</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <ScoreCard score={stats.safetyScore} label="安全评分" />
          
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 border border-gray-700">
            <div className="flex items-center gap-2 mb-4">
              <Route className="w-5 h-5 text-adas-blue" />
              <span className="text-gray-400 text-sm">智驾覆盖率</span>
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
                    stroke="url(#coverageGradient)"
                    strokeWidth="8"
                    fill="none"
                    strokeLinecap="round"
                    strokeDasharray={351.86}
                    strokeDashoffset={351.86 - (351.86 * adasCoverage) / 100}
                    className="transition-all duration-1000"
                  />
                  <defs>
                    <linearGradient id="coverageGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#0066FF" />
                      <stop offset="100%" stopColor="#00CC66" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-3xl font-bold text-white">{adasCoverage}%</span>
                </div>
              </div>
            </div>
            <div className="flex justify-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-adas-blue/20 text-adas-blue">
                智驾时长 {formatTime(stats.adasTime)}
              </span>
            </div>
          </div>

          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 border border-gray-700">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-5 h-5 text-adas-orange" />
              <span className="text-gray-400 text-sm">行驶统计</span>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">总里程</span>
                <span className="text-white font-semibold">{formatDistance(stats.totalDistance)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">总时长</span>
                <span className="text-white font-semibold">{formatTime(stats.totalTime)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">接管次数</span>
                <span className="text-adas-orange font-semibold">{stats.takeoverCount} 次</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div>
            <h2 className="text-xl font-semibold text-white mb-4">智驾状态</h2>
            <ADASStatusCard status={status} />
            
            <div className="mt-6 bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 border border-gray-700">
              <h3 className="text-lg font-semibold text-white mb-4">智驾控制</h3>
              
              <div className="flex flex-wrap gap-2 mb-4">
                {modes.map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setMode(mode)}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                      status.mode === mode
                        ? 'bg-adas-blue text-white'
                        : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                    }`}
                  >
                    {mode}
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
                
                <button
                  onClick={() => {
                    setIsRunning(false);
                    useDrivingStore.getState().resetStats();
                    useADASStore.getState().setMode('OFF');
                  }}
                  className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium bg-gray-800 text-gray-400 hover:bg-gray-700 transition-all"
                >
                  <RotateCcw className="w-5 h-5" />
                  重置
                </button>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-white mb-4">驾驶事件</h2>
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 border border-gray-700">
              {recentEvents.length === 0 ? (
                <div className="text-center py-12">
                  <Zap className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-500">暂无驾驶事件</p>
                  <p className="text-gray-600 text-sm">点击"开始模拟"开始记录</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentEvents.map((event) => (
                    <div
                      key={event.id}
                      className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-xl"
                    >
                      {event.type === 'hard_brake' && <ArrowDown className="w-5 h-5 text-adas-red" />}
                      {event.type === 'rapid_acceleration' && <ArrowUp className="w-5 h-5 text-adas-orange" />}
                      {event.type === 'lane_change' && <MoveHorizontal className="w-5 h-5 text-adas-blue" />}
                      {event.type === 'speeding' && <Gauge className="w-5 h-5 text-adas-red" />}
                      {event.type === 'takeover' && <AlertTriangle className="w-5 h-5 text-yellow-500" />}
                      
                      <div className="flex-1">
                        <span className="text-white font-medium">
                          {event.type === 'hard_brake' && '急刹车'}
                          {event.type === 'rapid_acceleration' && '急加速'}
                          {event.type === 'lane_change' && '变道'}
                          {event.type === 'speeding' && '超速'}
                          {event.type === 'takeover' && '接管'}
                        </span>
                        {event.details.speed && (
                          <span className="text-gray-500 text-sm ml-2">
                            {event.details.speed} km/h
                          </span>
                        )}
                      </div>
                      <span className="text-gray-500 text-sm">
                        {new Date(event.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}