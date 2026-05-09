'use client';

import { useState, useEffect } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { useDrivingStore } from '@/stores/drivingStore';
import { useADASStore } from '@/stores/adasStore';
import { formatTime, formatDistance, getEventLabel } from '@/utils/helpers';
import { 
  BarChart3, 
  Clock, 
  Route, 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown,
  Zap,
  Car,
  RotateCcw
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export default function AnalysisPage() {
  const { stats, resetStats } = useDrivingStore();
  const { status } = useADASStore();
  const [chartData, setChartData] = useState<{ time: string; score: number }[]>([]);

  useEffect(() => {
    const data = Array.from({ length: 24 }, (_, i) => ({
      time: `${i}:00`,
      score: Math.floor(Math.random() * 30 + 70),
    }));
    setChartData(data);
  }, []);

  const eventCounts = stats.events.reduce((acc, event) => {
    acc[event.type] = (acc[event.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const pieData = Object.entries(eventCounts).map(([name, value]) => ({
    name: getEventLabel(name),
    value,
  }));

  const COLORS = ['#FF3B30', '#FF9500', '#0066FF', '#FF2D55', '#FFCC00'];

  const recommendations = [
    '保持安全跟车距离，建议与前车保持3秒以上距离',
    '避免频繁变道，减少潜在风险',
    '使用NOA时注意观察周围环境，随时准备接管',
    '泊车时注意盲区，确保安全后再执行',
  ];

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <Sidebar />
      
      <main className="flex-1 p-8 overflow-auto">
        <header className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">驾驶分析</h1>
            <p className="text-gray-400">详细分析驾驶行为和智驾使用情况</p>
          </div>
          <button
            onClick={resetStats}
            className="flex items-center gap-2 px-4 py-2 bg-gray-800 text-gray-400 rounded-xl hover:bg-gray-700 transition-all"
          >
            <RotateCcw className="w-4 h-4" />
            重置数据
          </button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 border border-gray-700">
            <div className="flex items-center gap-2 mb-4">
              <Route className="w-5 h-5 text-adas-blue" />
              <span className="text-gray-400 text-sm">总里程</span>
            </div>
            <div className="text-3xl font-bold text-white">{formatDistance(stats.totalDistance)}</div>
          </div>

          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 border border-gray-700">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-5 h-5 text-adas-orange" />
              <span className="text-gray-400 text-sm">总时长</span>
            </div>
            <div className="text-3xl font-bold text-white">{formatTime(stats.totalTime)}</div>
          </div>

          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 border border-gray-700">
            <div className="flex items-center gap-2 mb-4">
              <Car className="w-5 h-5 text-adas-green" />
              <span className="text-gray-400 text-sm">智驾时长</span>
            </div>
            <div className="text-3xl font-bold text-white">{formatTime(stats.adasTime)}</div>
          </div>

          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 border border-gray-700">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="w-5 h-5 text-adas-red" />
              <span className="text-gray-400 text-sm">接管次数</span>
            </div>
            <div className="text-3xl font-bold text-adas-orange">{stats.takeoverCount}</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-adas-blue" />
              评分趋势 (24小时)
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="time" stroke="#9CA3AF" fontSize={12} />
                  <YAxis stroke="#9CA3AF" fontSize={12} domain={[60, 100]} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px' }}
                    labelStyle={{ color: '#9CA3AF' }}
                  />
                  <Line type="monotone" dataKey="score" stroke="#0066FF" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-adas-blue" />
              事件分布
            </h3>
            <div className="h-64">
              {pieData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {pieData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <Zap className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-500">暂无事件数据</p>
                  </div>
                </div>
              )}
            </div>
            <div className="flex flex-wrap gap-3 mt-4 justify-center">
              {pieData.map((entry, index) => (
                <div key={entry.name} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                  <span className="text-sm text-gray-400">{entry.name}: {entry.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-adas-orange" />
              事件列表
            </h3>
            {stats.events.length === 0 ? (
              <div className="text-center py-12">
                <Zap className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-500">暂无驾驶事件</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {stats.events.map((event) => (
                  <div key={event.id} className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-xl">
                    <div className={`px-2 py-1 rounded text-xs font-medium ${
                      event.type === 'hard_brake' ? 'bg-red-500/20 text-red-400' :
                      event.type === 'rapid_acceleration' ? 'bg-orange-500/20 text-orange-400' :
                      event.type === 'takeover' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-blue-500/20 text-blue-400'
                    }`}>
                      {getEventLabel(event.type)}
                    </div>
                    <div className="flex-1">
                      {event.details.speed && (
                        <span className="text-gray-400 text-sm">速度: {event.details.speed} km/h</span>
                      )}
                    </div>
                    <span className="text-gray-500 text-sm">
                      {new Date(event.timestamp).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <TrendingDown className="w-5 h-5 text-adas-green" />
              改进建议
            </h3>
            <div className="space-y-4">
              {recommendations.map((rec, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-gray-800/50 rounded-xl">
                  <div className="w-6 h-6 rounded-full bg-adas-blue/20 text-adas-blue flex items-center justify-center text-sm font-bold">
                    {index + 1}
                  </div>
                  <p className="text-gray-300 text-sm">{rec}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}