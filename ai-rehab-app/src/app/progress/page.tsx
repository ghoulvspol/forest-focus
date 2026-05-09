'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/Card';
import { ProgressBar, CircularProgress } from '@/components/ProgressBar';
import { mockAssessmentHistory, mockTrainingHistory, weeklyStatsData, mockUser } from '@/lib/mock-data';
import { cn, formatDate } from '@/lib/utils';

export default function ProgressPage() {
  const sessions = mockTrainingHistory;

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">康复报告</h1>
        <p className="text-gray-500 mt-1">追踪您的康复进度，查看详细的数据分析</p>
      </div>

      {/* Weekly Summary */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <CardContent className="py-4 text-center">
            <div className="text-3xl mb-1">🎯</div>
            <div className="text-2xl font-bold">{weeklyStatsData.sessionsCompleted}</div>
            <div className="text-blue-100 text-sm">本周训练次数</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
          <CardContent className="py-4 text-center">
            <div className="text-3xl mb-1">⏱️</div>
            <div className="text-2xl font-bold">{weeklyStatsData.totalMinutes}</div>
            <div className="text-green-100 text-sm">训练时长(分钟)</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <CardContent className="py-4 text-center">
            <div className="text-3xl mb-1">📊</div>
            <div className="text-2xl font-bold">{weeklyStatsData.averageAccuracy}%</div>
            <div className="text-purple-100 text-sm">平均准确率</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
          <CardContent className="py-4 text-center">
            <div className="text-3xl mb-1">📉</div>
            <div className="text-2xl font-bold">{weeklyStatsData.painReduction}%</div>
            <div className="text-orange-100 text-sm">疼痛缓解</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-pink-500 to-pink-600 text-white">
          <CardContent className="py-4 text-center">
            <div className="text-3xl mb-1">✨</div>
            <div className="text-2xl font-bold">{weeklyStatsData.xpEarned}</div>
            <div className="text-pink-100 text-sm">获得经验</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-red-500 to-red-600 text-white">
          <CardContent className="py-4 text-center">
            <div className="text-3xl mb-1">🔥</div>
            <div className="text-2xl font-bold">{weeklyStatsData.streakDays}</div>
            <div className="text-red-100 text-sm">连续天数</div>
          </CardContent>
        </Card>
      </div>

      {/* Recovery Trend */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span>📈</span> 康复趋势
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Overall Score Trend */}
            <div>
              <h4 className="font-medium text-gray-700 mb-4">综合评分趋势</h4>
              <div className="space-y-3">
                {mockAssessmentHistory.map((assessment, index) => (
                  <div key={assessment.id} className="flex items-center gap-3">
                    <span className="text-xs text-gray-500 w-20">{formatDate(assessment.date)}</span>
                    <div className="flex-1">
                      <ProgressBar
                        value={assessment.overallScore}
                        color={assessment.overallScore >= 70 ? 'green' : assessment.overallScore >= 50 ? 'yellow' : 'red'}
                        size="sm"
                        showValue={false}
                      />
                    </div>
                    <span className={cn(
                      'text-sm font-bold w-10 text-right',
                      assessment.overallScore >= 70 ? 'text-green-600' :
                      assessment.overallScore >= 50 ? 'text-yellow-600' : 'text-red-600'
                    )}>
                      {assessment.overallScore}
                    </span>
                    {index === 0 && (
                      <span className="text-xs text-green-600 bg-green-50 px-1.5 py-0.5 rounded">最新</span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Pain Level Trend */}
            <div>
              <h4 className="font-medium text-gray-700 mb-4">疼痛等级变化</h4>
              <div className="space-y-3">
                {mockAssessmentHistory.map((assessment, index) => (
                  <div key={assessment.id} className="flex items-center gap-3">
                    <span className="text-xs text-gray-500 w-20">{formatDate(assessment.date)}</span>
                    <div className="flex-1 flex gap-1">
                      {[...Array(10)].map((_, i) => (
                        <div
                          key={i}
                          className={cn(
                            'flex-1 h-6 rounded-sm transition-colors',
                            i < assessment.painLevel
                              ? i < 3 ? 'bg-green-400' : i < 6 ? 'bg-yellow-400' : 'bg-red-400'
                              : 'bg-gray-100'
                          )}
                        />
                      ))}
                    </div>
                    <span className={cn(
                      'text-sm font-bold w-8 text-right',
                      assessment.painLevel <= 3 ? 'text-green-600' :
                      assessment.painLevel <= 6 ? 'text-yellow-600' : 'text-red-600'
                    )}>
                      {assessment.painLevel}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span>🎯</span> 各维度评分
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {[
                { label: '关节活动度', value: mockUser.assessment?.mobilityScore || 0, color: 'blue', icon: '🦵' },
                { label: '肌肉力量', value: mockUser.assessment?.strengthScore || 0, color: 'green', icon: '💪' },
                { label: '柔韧性', value: mockUser.assessment?.flexibilityScore || 0, color: 'purple', icon: '🤸' },
                { label: '心理状态', value: mockUser.assessment?.mentalWellness || 0, color: 'yellow', icon: '🧠' },
              ].map(metric => (
                <div key={metric.label} className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-xl">
                    {metric.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700">{metric.label}</span>
                      <span className="text-sm font-bold text-gray-900">{metric.value}%</span>
                    </div>
                    <ProgressBar value={metric.value} color={metric.color as any} size="sm" showValue={false} />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span>📊</span> 康复效果分析
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center mb-6">
              <CircularProgress value={mockUser.assessment?.overallScore || 0} color="#3B82F6" size={160} strokeWidth={14}>
                <div className="text-center">
                  <div className="text-4xl font-bold text-blue-600">{mockUser.assessment?.overallScore}</div>
                  <div className="text-sm text-gray-500">综合评分</div>
                </div>
              </CircularProgress>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-green-50 rounded-xl text-center">
                <div className="text-lg font-bold text-green-600">+16%</div>
                <div className="text-xs text-green-700">相比上周</div>
              </div>
              <div className="p-3 bg-blue-50 rounded-xl text-center">
                <div className="text-lg font-bold text-blue-600">良好</div>
                <div className="text-xs text-blue-700">康复进度评价</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Training History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span>📋</span> 训练记录
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {sessions.map((session) => (
              <div
                key={session.id}
                className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
              >
                <div className={cn(
                  'w-12 h-12 rounded-xl flex items-center justify-center text-2xl',
                  session.mood === 'great' ? 'bg-green-100' :
                  session.mood === 'good' ? 'bg-blue-100' :
                  session.mood === 'okay' ? 'bg-yellow-100' : 'bg-red-100'
                )}>
                  {session.mood === 'great' ? '😄' : session.mood === 'good' ? '🙂' : session.mood === 'okay' ? '😐' : '😔'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-900">{session.planName}</div>
                  <div className="text-sm text-gray-500">{formatDate(session.date)}</div>
                </div>
                <div className="flex gap-6 text-center">
                  <div>
                    <div className="text-lg font-bold text-gray-900">{session.exercisesCompleted}/{session.totalExercises}</div>
                    <div className="text-xs text-gray-500">完成动作</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-blue-600">{session.duration}分</div>
                    <div className="text-xs text-gray-500">时长</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-green-600">{session.averageAccuracy}%</div>
                    <div className="text-xs text-gray-500">准确率</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-orange-600">+{session.xpEarned}</div>
                    <div className="text-xs text-gray-500">经验</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* AI Insights */}
      <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-green-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span>🤖</span> AI康复洞察
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-white rounded-xl shadow-sm">
              <div className="text-lg mb-2">📈</div>
              <h4 className="font-medium text-gray-900 mb-1">进步显著</h4>
              <p className="text-sm text-gray-600">
                过去两周，您的综合评分提升了16%，关节活动度改善最为明显。
              </p>
            </div>
            <div className="p-4 bg-white rounded-xl shadow-sm">
              <div className="text-lg mb-2">💡</div>
              <h4 className="font-medium text-gray-900 mb-1">优化建议</h4>
              <p className="text-sm text-gray-600">
                建议增加柔韧性训练比例，配合中医穴位按摩可以加速恢复。
              </p>
            </div>
            <div className="p-4 bg-white rounded-xl shadow-sm">
              <div className="text-lg mb-2">🎯</div>
              <h4 className="font-medium text-gray-900 mb-1">目标预测</h4>
              <p className="text-sm text-gray-600">
                按当前进度，预计3周后疼痛等级可降至2以下，达到康复目标。
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
