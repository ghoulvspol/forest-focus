'use client';

import { useState } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { useReportStore, generateReport } from '@/stores/reportStore';
import { useDrivingStore } from '@/stores/drivingStore';
import { formatTime, formatDistance } from '@/utils/helpers';
import { ReportPeriod } from '@/types';
import { 
  FileText, 
  Plus, 
  Calendar, 
  TrendingUp, 
  TrendingDown,
  Clock,
  Route,
  Shield,
  Car,
  ChevronRight,
  Download,
  Trash2
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function ReportsPage() {
  const { reports, addReport, currentReport, setCurrentReport, deleteReport } = useReportStore();
  const { stats } = useDrivingStore();
  const [period, setPeriod] = useState<ReportPeriod>('daily');

  const handleGenerateReport = () => {
    const report = generateReport(period);
    addReport(report);
  };

  const getPeriodLabel = (p: ReportPeriod) => {
    return p === 'daily' ? '日报' : p === 'weekly' ? '周报' : '月报';
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <Sidebar />
      
      <main className="flex-1 p-8 overflow-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">驾驶报告</h1>
          <p className="text-gray-400">生成和分析驾驶报告</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2">
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 border border-gray-700">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <FileText className="w-5 h-5 text-adas-blue" />
                  生成报告
                </h3>
              </div>

              <div className="flex flex-wrap gap-3 mb-6">
                {(['daily', 'weekly', 'monthly'] as ReportPeriod[]).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPeriod(p)}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                      period === p
                        ? 'bg-adas-blue text-white'
                        : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                    }`}
                  >
                    {getPeriodLabel(p)}
                  </button>
                ))}
              </div>

              <button
                onClick={handleGenerateReport}
                className="flex items-center gap-2 px-6 py-3 bg-adas-blue text-white rounded-xl hover:bg-adas-blue/90 transition-all"
              >
                <Plus className="w-5 h-5" />
                生成{getPeriodLabel(period)}报告
              </button>
            </div>

            <div className="mt-6 bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 border border-gray-700">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-adas-blue" />
                历史报告
              </h3>
              
              {reports.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-500">暂无报告</p>
                  <p className="text-gray-600 text-sm">点击上方按钮生成报告</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {reports.map((report) => (
                    <div
                      key={report.id}
                      className={`p-4 rounded-xl cursor-pointer transition-all flex items-center justify-between ${
                        currentReport?.id === report.id
                          ? 'bg-adas-blue/20 border border-adas-blue/30'
                          : 'bg-gray-800/50 hover:bg-gray-800 border border-transparent'
                      }`}
                      onClick={() => setCurrentReport(report)}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`px-3 py-1 rounded-full text-sm ${
                          report.period === 'daily' ? 'bg-adas-blue/20 text-adas-blue' :
                          report.period === 'weekly' ? 'bg-adas-green/20 text-adas-green' :
                          'bg-adas-orange/20 text-adas-orange'
                        }`}>
                          {getPeriodLabel(report.period)}
                        </div>
                        <div>
                          <div className="text-white font-medium">{report.date}</div>
                          <div className="text-gray-500 text-sm">安全评分: {report.summary.safetyScore}分</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <ChevronRight className="w-5 h-5 text-gray-500" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div>
            {currentReport ? (
              <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 border border-gray-700">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">报告详情</h3>
                  <button
                    onClick={() => deleteReport(currentReport.id)}
                    className="p-2 text-gray-500 hover:text-adas-red transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="p-4 bg-gray-800/50 rounded-xl">
                    <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
                      <Shield className="w-4 h-4" />
                      安全评分
                    </div>
                    <div className={`text-3xl font-bold ${
                      currentReport.summary.safetyScore >= 90 ? 'text-green-500' :
                      currentReport.summary.safetyScore >= 70 ? 'text-yellow-500' : 'text-red-500'
                    }`}>
                      {currentReport.summary.safetyScore}分
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-gray-800/50 rounded-xl">
                      <div className="flex items-center gap-2 text-gray-400 text-xs mb-1">
                        <Route className="w-3 h-3" />
                        总里程
                      </div>
                      <div className="text-white font-semibold">{formatDistance(currentReport.summary.totalDistance)}</div>
                    </div>
                    <div className="p-3 bg-gray-800/50 rounded-xl">
                      <div className="flex items-center gap-2 text-gray-400 text-xs mb-1">
                        <Clock className="w-3 h-3" />
                        总时长
                      </div>
                      <div className="text-white font-semibold">{formatTime(currentReport.summary.totalTime)}</div>
                    </div>
                    <div className="p-3 bg-gray-800/50 rounded-xl">
                      <div className="flex items-center gap-2 text-gray-400 text-xs mb-1">
                        <Car className="w-3 h-3" />
                        智驾覆盖
                      </div>
                      <div className="text-white font-semibold">{currentReport.summary.adasCoverage}%</div>
                    </div>
                    <div className="p-3 bg-gray-800/50 rounded-xl">
                      <div className="flex items-center gap-2 text-gray-400 text-xs mb-1">
                        <Shield className="w-3 h-3" />
                        评分
                      </div>
                      <div className="text-white font-semibold">{currentReport.summary.safetyScore}</div>
                    </div>
                  </div>

                  <div className="h-40 mt-4">
                    <div className="text-gray-400 text-sm mb-2">评分趋势</div>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={currentReport.details.scores.map((s, i) => ({ day: i + 1, score: s }))}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis dataKey="day" stroke="#9CA3AF" fontSize={10} />
                        <YAxis stroke="#9CA3AF" fontSize={10} domain={[60, 100]} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px' }}
                          labelStyle={{ color: '#9CA3AF' }}
                        />
                        <Line type="monotone" dataKey="score" stroke="#0066FF" strokeWidth={2} dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>

                  {currentReport.details.recommendations.length > 0 && (
                    <div className="mt-4">
                      <div className="text-gray-400 text-sm mb-2">改进建议</div>
                      <div className="space-y-2">
                        {currentReport.details.recommendations.map((rec, index) => (
                          <div key={index} className="p-2 bg-gray-800/50 rounded-lg text-gray-300 text-sm">
                            {rec}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 border border-gray-700 flex items-center justify-center h-96">
                <div className="text-center">
                  <FileText className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-500">请选择报告查看详情</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}