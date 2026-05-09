'use client';

import { useState } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { useAccidentStore, createTestCase } from '@/stores/accidentStore';
import { useADASStore } from '@/stores/adasStore';
import { getJudgmentLabel, getModeLabel, formatDate } from '@/utils/helpers';
import { 
  AlertTriangle, 
  Plus, 
  Play, 
  Search, 
  CheckCircle, 
  XCircle,
  HelpCircle,
  Clock,
  Car,
  Gauge
} from 'lucide-react';

export default function AccidentPage() {
  const { cases, addCase, judgeCase, setCurrentCase, currentCase, deleteCase } = useAccidentStore();
  const { status } = useADASStore();
  const [filter, setFilter] = useState<'all' | 'pending' | 'adas_accident' | 'normal_accident' | 'unclear'>('all');

  const filteredCases = cases.filter(c => filter === 'all' || c.judgment === filter);

  const handleCreateCase = () => {
    const caseData = createTestCase(status);
    addCase(caseData);
  };

  const handleJudge = (caseId: string) => {
    judgeCase(caseId);
  };

  const getJudgmentIcon = (judgment: string) => {
    switch (judgment) {
      case 'adas_accident':
        return <CheckCircle className="w-5 h-5 text-adas-blue" />;
      case 'normal_accident':
        return <XCircle className="w-5 h-5 text-adas-orange" />;
      case 'unclear':
        return <HelpCircle className="w-5 h-5 text-yellow-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <Sidebar />
      
      <main className="flex-1 p-8 overflow-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">事故判定</h1>
          <p className="text-gray-400">模拟智驾事故检测和判定流程</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-1">
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 border border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-adas-orange" />
                  案例列表
                </h3>
                <button
                  onClick={handleCreateCase}
                  className="flex items-center gap-2 px-3 py-2 bg-adas-blue/20 text-adas-blue rounded-lg hover:bg-adas-blue/30 transition-all"
                >
                  <Plus className="w-4 h-4" />
                  新建案例
                </button>
              </div>

              <div className="flex gap-2 mb-4">
                {(['all', 'pending', 'adas_accident', 'normal_accident', 'unclear'] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`px-3 py-1 rounded-lg text-sm transition-all ${
                      filter === f
                        ? 'bg-adas-blue text-white'
                        : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                    }`}
                  >
                    {f === 'all' ? '全部' : f === 'pending' ? '待判定' : f === 'adas_accident' ? '智驾事故' : f === 'normal_accident' ? '普通事故' : '无法判定'}
                  </button>
                ))}
              </div>

              <div className="space-y-3 max-h-96 overflow-y-auto">
                {filteredCases.length === 0 ? (
                  <div className="text-center py-8">
                    <AlertTriangle className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-500">暂无案例</p>
                  </div>
                ) : (
                  filteredCases.map((c) => (
                    <div
                      key={c.id}
                      onClick={() => setCurrentCase(c)}
                      className={`p-4 rounded-xl cursor-pointer transition-all ${
                        currentCase?.id === c.id
                          ? 'bg-adas-blue/20 border border-adas-blue/30'
                          : 'bg-gray-800/50 hover:bg-gray-800 border border-transparent'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-white font-medium">案例 {c.id.slice(0, 8)}</span>
                        {getJudgmentIcon(c.judgment)}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <Clock className="w-4 h-4" />
                        {formatDate(c.timestamp)}
                      </div>
                      <div className={`mt-2 px-2 py-1 rounded text-xs font-medium inline-block ${getJudgmentLabel(c.judgment).color} bg-opacity-20`}>
                        {getJudgmentLabel(c.judgment).label}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            {currentCase ? (
              <div className="space-y-6">
                <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 border border-gray-700">
                  <h3 className="text-lg font-semibold text-white mb-4">事故信息</h3>
                  
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-gray-800/50 rounded-xl p-4">
                      <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
                        <Car className="w-4 h-4" />
                        智驾模式
                      </div>
                      <div className="text-white font-semibold">{getModeLabel(currentCase.adasStatus.mode)}</div>
                    </div>
                    <div className="bg-gray-800/50 rounded-xl p-4">
                      <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
                        <Gauge className="w-4 h-4" />
                        车速
                      </div>
                      <div className="text-white font-semibold">{currentCase.vehicleData.speed} km/h</div>
                    </div>
                    <div className="bg-gray-800/50 rounded-xl p-4">
                      <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
                        <AlertTriangle className="w-4 h-4" />
                        制动状态
                      </div>
                      <div className={`font-semibold ${
                        currentCase.vehicleData.brakeStatus === 'hard' ? 'text-adas-red' :
                        currentCase.vehicleData.brakeStatus === 'normal' ? 'text-adas-orange' : 'text-gray-400'
                      }`}>
                        {currentCase.vehicleData.brakeStatus === 'hard' ? '紧急制动' :
                         currentCase.vehicleData.brakeStatus === 'normal' ? '正常制动' : '未制动'}
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-gray-800/50 rounded-xl">
                    <div className="text-gray-400 text-sm mb-2">智驾状态</div>
                    <div className="flex items-center gap-4">
                      <div className={`px-3 py-1 rounded-full text-sm ${
                        currentCase.adasStatus.isActive ? 'bg-adas-green/20 text-adas-green' : 'bg-gray-700 text-gray-400'
                      }`}>
                        {currentCase.adasStatus.isActive ? '智驾开启' : '智驾关闭'}
                      </div>
                      <div className="text-gray-400 text-sm">
                        车道保持: {currentCase.adasStatus.laneKeep ? '正常' : '偏离'}
                      </div>
                      <div className="text-gray-400 text-sm">
                        跟车距离: {currentCase.adasStatus.followDistance} 档
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 border border-gray-700">
                  <h3 className="text-lg font-semibold text-white mb-4">判定结果</h3>
                  
                  {currentCase.judgment === 'pending' ? (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-800 flex items-center justify-center">
                        <Search className="w-8 h-8 text-gray-500" />
                      </div>
                      <p className="text-gray-400 mb-4">待判定</p>
                      <button
                        onClick={() => handleJudge(currentCase.id)}
                        className="flex items-center gap-2 px-6 py-3 bg-adas-blue text-white rounded-xl hover:bg-adas-blue/90 transition-all mx-auto"
                      >
                        <Play className="w-5 h-5" />
                        开始判定
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className={`p-4 rounded-xl ${
                        currentCase.judgment === 'adas_accident' ? 'bg-adas-blue/20 border border-adas-blue/30' :
                        currentCase.judgment === 'normal_accident' ? 'bg-adas-orange/20 border border-adas-orange/30' :
                        'bg-yellow-500/20 border border-yellow-500/30'
                      }`}>
                        <div className="flex items-center gap-3 mb-2">
                          {getJudgmentIcon(currentCase.judgment)}
                          <span className={`font-semibold ${
                            currentCase.judgment === 'adas_accident' ? 'text-adas-blue' :
                            currentCase.judgment === 'normal_accident' ? 'text-adas-orange' : 'text-yellow-500'
                          }`}>
                            {getJudgmentLabel(currentCase.judgment).label}
                          </span>
                        </div>
                        <p className="text-gray-300 text-sm">{currentCase.result}</p>
                      </div>
                      
                      {currentCase.judgmentTime && (
                        <div className="text-gray-500 text-sm">
                          判定时间: {formatDate(currentCase.judgmentTime)}
                        </div>
                      )}

                      {currentCase.judgment === 'adas_accident' && (
                        <div className="p-4 bg-adas-green/10 rounded-xl border border-adas-green/30">
                          <h4 className="text-adas-green font-semibold mb-2">权益说明</h4>
                          <ul className="text-gray-300 text-sm space-y-1">
                            <li>• 豁免当次出险次数</li>
                            <li>• 续保不涨价</li>
                            <li>• 享受智驾专属理赔服务</li>
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 border border-gray-700 flex items-center justify-center h-96">
                <div className="text-center">
                  <AlertTriangle className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-500">请选择或创建案例</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}