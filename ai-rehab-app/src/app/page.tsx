'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/Card';
import { StatCard, UserProfileCard } from '@/components/UserCard';
import { ProgressBar, CircularProgress } from '@/components/ProgressBar';
import { Button } from '@/components/Button';
import { mockUser, mockTrainingPlans, mockTrainingHistory, weeklyStatsData, mockLeaderboard } from '@/lib/mock-data';
import { formatDate, cn } from '@/lib/utils';
import Link from 'next/link';

export default function Dashboard() {
  const user = mockUser;
  const activePlan = mockTrainingPlans.find(p => p.status === 'active');
  const recentSessions = mockTrainingHistory.slice(0, 3);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            早上好，{user.name} 👋
          </h1>
          <p className="text-gray-500 mt-1">
            今天是你连续训练的第 {user.streak} 天，继续保持！
          </p>
        </div>
        <Link href="/exercise">
          <Button size="lg" icon={<span>▶️</span>}>
            开始今日训练
          </Button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard icon="🔥" label="连续训练" value={`${user.streak} 天`} change={12} color="orange" />
        <StatCard icon="📊" label="整体康复评分" value={`${user.assessment?.overallScore || 0} 分`} change={8} color="green" />
        <StatCard icon="🎯" label="本周训练" value={`${weeklyStatsData.sessionsCompleted} 次`} change={15} color="blue" />
        <StatCard icon="⏱️" label="本周训练时长" value={`${weeklyStatsData.totalMinutes} 分钟`} color="purple" />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User Profile Card */}
        <div className="lg:col-span-1">
          <UserProfileCard
            name={user.name}
            level={user.level}
            xp={user.xp}
            streak={user.streak}
            condition={user.condition}
          />
        </div>

        {/* Active Training Plan */}
        <div className="lg:col-span-2">
          <Card className="h-full">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <span>💪</span> 当前训练计划
              </CardTitle>
              <Link href="/training">
                <Button variant="ghost" size="sm">查看全部</Button>
              </Link>
            </CardHeader>
            <CardContent>
              {activePlan ? (
                <div className="space-y-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-lg text-gray-900">{activePlan.name}</h3>
                      <p className="text-sm text-gray-500 mt-1">{activePlan.description}</p>
                    </div>
                    <span className={cn(
                      'px-3 py-1 rounded-full text-xs font-medium',
                      activePlan.difficulty === 'beginner' ? 'bg-green-50 text-green-700' :
                      activePlan.difficulty === 'intermediate' ? 'bg-yellow-50 text-yellow-700' :
                      'bg-red-50 text-red-700'
                    )}>
                      {activePlan.difficulty === 'beginner' ? '初级' : activePlan.difficulty === 'intermediate' ? '中级' : '高级'}
                    </span>
                  </div>

                  <ProgressBar
                    value={activePlan.progress}
                    label="训练进度"
                    color="blue"
                    size="lg"
                  />

                  <div className="grid grid-cols-3 gap-4 pt-2">
                    <div className="text-center p-3 bg-blue-50 rounded-xl">
                      <div className="text-2xl font-bold text-blue-600">{activePlan.exercises.length}</div>
                      <div className="text-xs text-gray-500 mt-1">训练动作</div>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-xl">
                      <div className="text-2xl font-bold text-green-600">{activePlan.duration}</div>
                      <div className="text-xs text-gray-500 mt-1">计划天数</div>
                    </div>
                    <div className="text-center p-3 bg-purple-50 rounded-xl">
                      <div className="text-2xl font-bold text-purple-600">
                        {activePlan.exercises.filter(e => e.completed).length}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">已完成</div>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <Link href="/exercise" className="flex-1">
                      <Button className="w-full">继续训练</Button>
                    </Link>
                    <Link href="/training" className="flex-1">
                      <Button variant="outline" className="w-full">查看详情</Button>
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-4xl mb-3">📋</div>
                  <p className="text-gray-500">暂无活跃的训练计划</p>
                  <Link href="/assessment">
                    <Button className="mt-4">开始AI评估</Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* AI Recommendations & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* AI Recommendations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span>🤖</span> AI康复建议
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {user.assessment?.aiRecommendations.map((rec, index) => (
                <div
                  key={index}
                  className={cn(
                    'flex items-start gap-3 p-3 rounded-xl',
                    index === 0 ? 'bg-blue-50 border border-blue-100' : 'bg-gray-50'
                  )}
                >
                  <span className="text-lg flex-shrink-0">
                    {index === 0 ? '💡' : index === 1 ? '📌' : '✨'}
                  </span>
                  <p className="text-sm text-gray-700">{rec}</p>
                </div>
              ))}
            </div>
            <Link href="/assessment">
              <Button variant="outline" className="w-full mt-4">
                查看完整评估报告
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span>📋</span> 最近训练记录
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentSessions.map((session) => (
                <div
                  key={session.id}
                  className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  <div className={cn(
                    'w-10 h-10 rounded-xl flex items-center justify-center text-lg',
                    session.mood === 'great' ? 'bg-green-100' :
                    session.mood === 'good' ? 'bg-blue-100' :
                    session.mood === 'okay' ? 'bg-yellow-100' : 'bg-red-100'
                  )}>
                    {session.mood === 'great' ? '😄' : session.mood === 'good' ? '🙂' : session.mood === 'okay' ? '😐' : '😔'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 truncate">{session.planName}</div>
                    <div className="text-xs text-gray-500">
                      {formatDate(session.date)} · {session.duration}分钟 · +{session.xpEarned} XP
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-blue-600">{session.averageAccuracy}%</div>
                    <div className="text-xs text-gray-500">准确率</div>
                  </div>
                </div>
              ))}
            </div>
            <Link href="/progress">
              <Button variant="outline" className="w-full mt-4">
                查看全部记录
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Leaderboard & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Leaderboard */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <span>🏆</span> 康复排行榜
            </CardTitle>
            <Link href="/achievements">
              <Button variant="ghost" size="sm">查看全部</Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {mockLeaderboard.slice(0, 5).map((entry) => (
                <div
                  key={entry.rank}
                  className={cn(
                    'flex items-center gap-4 p-3 rounded-xl',
                    entry.rank <= 3 ? 'bg-gradient-to-r from-yellow-50 to-orange-50' : 'bg-gray-50',
                    entry.user.name === user.name && 'ring-2 ring-blue-500 ring-offset-1'
                  )}
                >
                  <div className={cn(
                    'w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm',
                    entry.rank === 1 ? 'bg-yellow-400 text-white' :
                    entry.rank === 2 ? 'bg-gray-300 text-white' :
                    entry.rank === 3 ? 'bg-orange-400 text-white' : 'bg-gray-200 text-gray-600'
                  )}>
                    {entry.rank}
                  </div>
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-medium">
                    {entry.user.name[0]}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">
                      {entry.user.name}
                      {entry.user.name === user.name && <span className="text-xs text-blue-500 ml-2">（我）</span>}
                    </div>
                    <div className="text-xs text-gray-500">Lv.{entry.user.level} · 连续{entry.streak}天</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-gray-900">{entry.xp.toLocaleString()}</div>
                    <div className="text-xs text-gray-500">经验值</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span>⚡</span> 快捷操作
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Link href="/assessment" className="block">
                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors cursor-pointer">
                  <span className="text-2xl">🎯</span>
                  <div>
                    <div className="font-medium text-gray-900">AI评估</div>
                    <div className="text-xs text-gray-500">重新评估康复状态</div>
                  </div>
                </div>
              </Link>
              <Link href="/exercise" className="block">
                <div className="flex items-center gap-3 p-3 bg-green-50 rounded-xl hover:bg-green-100 transition-colors cursor-pointer">
                  <span className="text-2xl">🎮</span>
                  <div>
                    <div className="font-medium text-gray-900">开始训练</div>
                    <div className="text-xs text-gray-500">今日康复训练课程</div>
                  </div>
                </div>
              </Link>
              <Link href="/chat" className="block">
                <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-xl hover:bg-purple-100 transition-colors cursor-pointer">
                  <span className="text-2xl">🤖</span>
                  <div>
                    <div className="font-medium text-gray-900">AI助手</div>
                    <div className="text-xs text-gray-500">咨询康复问题</div>
                  </div>
                </div>
              </Link>
              <Link href="/progress" className="block">
                <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-xl hover:bg-orange-100 transition-colors cursor-pointer">
                  <span className="text-2xl">📈</span>
                  <div>
                    <div className="font-medium text-gray-900">康复报告</div>
                    <div className="text-xs text-gray-500">查看康复进度</div>
                  </div>
                </div>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
