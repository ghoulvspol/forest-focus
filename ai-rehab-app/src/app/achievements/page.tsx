'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/Card';
import { ProgressBar } from '@/components/ProgressBar';
import { mockAchievements, mockUser } from '@/lib/mock-data';
import { cn, getRarityColor } from '@/lib/utils';

type CategoryFilter = 'all' | 'training' | 'streak' | 'progress' | 'social' | 'special';

export default function AchievementsPage() {
  const [filter, setFilter] = useState<CategoryFilter>('all');

  const categories = [
    { id: 'all' as CategoryFilter, label: '全部', icon: '🏅' },
    { id: 'training' as CategoryFilter, label: '训练', icon: '💪' },
    { id: 'streak' as CategoryFilter, label: '坚持', icon: '🔥' },
    { id: 'progress' as CategoryFilter, label: '进度', icon: '📈' },
    { id: 'social' as CategoryFilter, label: '社交', icon: '👥' },
    { id: 'special' as CategoryFilter, label: '特殊', icon: '⭐' },
  ];

  const filteredAchievements = filter === 'all'
    ? mockAchievements
    : mockAchievements.filter(a => a.category === filter);

  const unlockedCount = mockAchievements.filter(a => a.unlockedAt).length;
  const totalXpEarned = mockAchievements
    .filter(a => a.unlockedAt)
    .reduce((sum, a) => sum + a.xpReward, 0);

  const rarityLabels: Record<string, string> = {
    common: '普通',
    rare: '稀有',
    epic: '史诗',
    legendary: '传说',
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">成就系统</h1>
        <p className="text-gray-500 mt-1">完成挑战，解锁成就，获得丰厚奖励</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200">
          <CardContent className="py-4 text-center">
            <div className="text-3xl mb-1">🏆</div>
            <div className="text-2xl font-bold text-yellow-700">{unlockedCount}/{mockAchievements.length}</div>
            <div className="text-sm text-yellow-600">已解锁成就</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
          <CardContent className="py-4 text-center">
            <div className="text-3xl mb-1">✨</div>
            <div className="text-2xl font-bold text-blue-700">{totalXpEarned}</div>
            <div className="text-sm text-blue-600">成就获得经验</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
          <CardContent className="py-4 text-center">
            <div className="text-3xl mb-1">🔥</div>
            <div className="text-2xl font-bold text-green-700">{mockUser.streak}</div>
            <div className="text-sm text-green-600">连续训练天数</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
          <CardContent className="py-4 text-center">
            <div className="text-3xl mb-1">📊</div>
            <div className="text-2xl font-bold text-purple-700">Lv.{mockUser.level}</div>
            <div className="text-sm text-purple-600">当前等级</div>
          </CardContent>
        </Card>
      </div>

      {/* Level Progress */}
      <Card>
        <CardContent className="py-6">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-3xl font-bold shadow-lg">
              {mockUser.level}
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-gray-900">等级 {mockUser.level}</span>
                <span className="text-sm text-gray-500">{mockUser.xp} / {mockUser.xpToNextLevel} XP</span>
              </div>
              <ProgressBar value={mockUser.xp} max={mockUser.xpToNextLevel} color="purple" size="lg" showValue={false} />
              <p className="text-sm text-gray-500 mt-2">
                还需 {mockUser.xpToNextLevel - mockUser.xp} 经验值升级到 Lv.{mockUser.level + 1}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Category Filter */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setFilter(cat.id)}
            className={cn(
              'flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all',
              filter === cat.id
                ? 'bg-blue-500 text-white shadow-sm'
                : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
            )}
          >
            <span>{cat.icon}</span>
            {cat.label}
          </button>
        ))}
      </div>

      {/* Achievements Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAchievements.map((achievement) => {
          const isUnlocked = !!achievement.unlockedAt;
          const progressPercent = (achievement.progress / achievement.target) * 100;

          return (
            <Card
              key={achievement.id}
              className={cn(
                'overflow-hidden transition-all',
                isUnlocked ? 'border-green-200' : 'opacity-75'
              )}
            >
              <div className={cn(
                'h-1.5 bg-gradient-to-r',
                getRarityColor(achievement.rarity)
              )} />
              <CardContent className="pt-5">
                <div className="flex items-start gap-4">
                  <div className={cn(
                    'w-14 h-14 rounded-xl flex items-center justify-center text-3xl',
                    isUnlocked ? 'bg-yellow-50' : 'bg-gray-100 grayscale'
                  )}>
                    {achievement.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className={cn(
                        'font-semibold',
                        isUnlocked ? 'text-gray-900' : 'text-gray-500'
                      )}>
                        {achievement.name}
                      </h3>
                      <span className={cn(
                        'px-1.5 py-0.5 text-xs rounded',
                        achievement.rarity === 'common' ? 'bg-gray-100 text-gray-600' :
                        achievement.rarity === 'rare' ? 'bg-blue-100 text-blue-600' :
                        achievement.rarity === 'epic' ? 'bg-purple-100 text-purple-600' :
                        'bg-yellow-100 text-yellow-700'
                      )}>
                        {rarityLabels[achievement.rarity]}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">{achievement.description}</p>
                  </div>
                </div>

                <div className="mt-4">
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-gray-500">进度</span>
                    <span className={cn(
                      'font-medium',
                      isUnlocked ? 'text-green-600' : 'text-gray-600'
                    )}>
                      {achievement.progress}/{achievement.target}
                    </span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={cn(
                        'h-full rounded-full transition-all duration-500',
                        isUnlocked ? 'bg-gradient-to-r from-green-400 to-green-600' : 'bg-blue-400'
                      )}
                      style={{ width: `${Math.min(100, progressPercent)}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between mt-4">
                  <div className="flex items-center gap-1 text-sm text-yellow-600">
                    <span>⭐</span>
                    <span>+{achievement.xpReward} XP</span>
                  </div>
                  {isUnlocked ? (
                    <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
                      ✅ 已解锁
                    </span>
                  ) : (
                    <span className="text-xs text-gray-400">
                      {achievement.target - achievement.progress} 还需完成
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Leaderboard */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span>🏆</span> 康复排行榜
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[
              { rank: 1, name: '张伟', level: 18, xp: 5200, streak: 21 },
              { rank: 2, name: '王芳', level: 16, xp: 4800, streak: 14 },
              { rank: 3, name: '刘洋', level: 15, xp: 4350, streak: 12 },
              { rank: 4, name: '陈静', level: 14, xp: 3900, streak: 10 },
              { rank: 5, name: '李明', level: 12, xp: 2850, streak: 7, isMe: true },
              { rank: 6, name: '赵丽', level: 11, xp: 2600, streak: 5 },
              { rank: 7, name: '孙强', level: 10, xp: 2200, streak: 8 },
            ].map((entry) => (
              <div
                key={entry.rank}
                className={cn(
                  'flex items-center gap-4 p-3 rounded-xl',
                  entry.rank <= 3 ? 'bg-gradient-to-r from-yellow-50 to-orange-50' : 'bg-gray-50',
                  entry.isMe && 'ring-2 ring-blue-500 ring-offset-1'
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
                  {entry.name[0]}
                </div>
                <div className="flex-1">
                  <div className="font-medium text-gray-900">
                    {entry.name}
                    {entry.isMe && <span className="text-xs text-blue-500 ml-2">（我）</span>}
                  </div>
                  <div className="text-xs text-gray-500">Lv.{entry.level} · 连续{entry.streak}天</div>
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
    </div>
  );
}
