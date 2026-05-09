'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/Card';
import { Button } from '@/components/Button';
import { ProgressBar } from '@/components/ProgressBar';
import { mockTrainingPlans } from '@/lib/mock-data';
import { cn, getDifficultyColor, getDifficultyLabel } from '@/lib/utils';
import Link from 'next/link';

type TabType = 'active' | 'recommended' | 'tcm';

export default function TrainingPage() {
  const [activeTab, setActiveTab] = useState<TabType>('active');

  const activePlans = mockTrainingPlans.filter(p => p.status === 'active');
  const tcmPlans = mockTrainingPlans.filter(p => p.isTraditionalChineseMedicine);
  const recommendedPlans = mockTrainingPlans.filter(p => p.status !== 'completed');

  const tabs = [
    { id: 'active' as TabType, label: '进行中', count: activePlans.length },
    { id: 'recommended' as TabType, label: '推荐计划', count: recommendedPlans.length },
    { id: 'tcm' as TabType, label: '中医康复', count: tcmPlans.length },
  ];

  const renderPlan = (plan: typeof mockTrainingPlans[0]) => (
    <Card key={plan.id} hover className="overflow-hidden">
      <div className={cn(
        'h-2',
        plan.isTraditionalChineseMedicine
          ? 'bg-gradient-to-r from-amber-500 to-red-500'
          : 'bg-gradient-to-r from-blue-500 to-green-500'
      )} />
      <CardContent className="pt-5">
        <div className="flex items-start justify-between mb-3">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-gray-900">{plan.name}</h3>
              {plan.isTraditionalChineseMedicine && (
                <span className="px-2 py-0.5 bg-amber-50 text-amber-700 text-xs rounded-full">中医</span>
              )}
            </div>
            <p className="text-sm text-gray-500 mt-1">{plan.description}</p>
          </div>
          <span className={cn(
            'px-3 py-1 rounded-full text-xs font-medium',
            getDifficultyColor(plan.difficulty)
          )}>
            {getDifficultyLabel(plan.difficulty)}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-3 my-4">
          <div className="text-center p-2 bg-gray-50 rounded-lg">
            <div className="text-lg font-bold text-gray-900">{plan.exercises.length}</div>
            <div className="text-xs text-gray-500">训练动作</div>
          </div>
          <div className="text-center p-2 bg-gray-50 rounded-lg">
            <div className="text-lg font-bold text-gray-900">{plan.duration}</div>
            <div className="text-xs text-gray-500">计划天数</div>
          </div>
          <div className="text-center p-2 bg-gray-50 rounded-lg">
            <div className="text-lg font-bold text-gray-900">{plan.progress}%</div>
            <div className="text-xs text-gray-500">完成度</div>
          </div>
        </div>

        <ProgressBar value={plan.progress} color="blue" size="sm" showValue={false} />

        <div className="mt-4">
          <div className="text-xs text-gray-500 mb-2">训练动作预览</div>
          <div className="flex flex-wrap gap-1.5">
            {plan.exercises.slice(0, 4).map(ex => (
              <span key={ex.id} className={cn(
                'px-2 py-1 text-xs rounded-md',
                ex.completed ? 'bg-green-50 text-green-700' : 'bg-gray-50 text-gray-600'
              )}>
                {ex.completed ? '✅' : '○'} {ex.name}
              </span>
            ))}
            {plan.exercises.length > 4 && (
              <span className="px-2 py-1 text-xs rounded-md bg-gray-50 text-gray-500">
                +{plan.exercises.length - 4}个
              </span>
            )}
          </div>
        </div>

        <div className="flex gap-2 mt-4">
          {plan.status === 'locked' ? (
            <Button disabled className="flex-1" variant="outline">
              🔒 完成当前计划后解锁
            </Button>
          ) : (
            <>
              <Link href="/exercise" className="flex-1">
                <Button className="w-full">
                  {plan.progress > 0 ? '继续训练' : '开始训练'}
                </Button>
              </Link>
              <Button variant="outline" onClick={() => {}}>
                查看详情
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">训练计划</h1>
          <p className="text-gray-500 mt-1">AI个性化康复训练方案，融合现代医学与中医理念</p>
        </div>
        <Link href="/assessment">
          <Button variant="outline">🎯 重新评估</Button>
        </Link>
      </div>

      {/* Feature Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <span className="text-3xl">🤖</span>
              <div>
                <div className="font-semibold text-blue-900">AI智能生成</div>
                <div className="text-xs text-blue-700">根据评估结果自动推荐</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <span className="text-3xl">🏥</span>
              <div>
                <div className="font-semibold text-green-900">中西医结合</div>
                <div className="text-xs text-green-700">融合传统与现代康复</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <span className="text-3xl">📈</span>
              <div>
                <div className="font-semibold text-purple-900">动态调整</div>
                <div className="text-xs text-purple-700">根据进度实时优化</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200 pb-0">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'px-4 py-2.5 text-sm font-medium rounded-t-lg transition-all',
              activeTab === tab.id
                ? 'bg-white text-blue-600 border border-gray-200 border-b-white -mb-px'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            )}
          >
            {tab.label}
            <span className={cn(
              'ml-1.5 px-1.5 py-0.5 text-xs rounded-full',
              activeTab === tab.id ? 'bg-blue-50 text-blue-600' : 'bg-gray-100 text-gray-500'
            )}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {activeTab === 'active' && activePlans.map(renderPlan)}
        {activeTab === 'recommended' && recommendedPlans.map(renderPlan)}
        {activeTab === 'tcm' && tcmPlans.map(renderPlan)}

        {activeTab === 'active' && activePlans.length === 0 && (
          <Card className="col-span-2 py-12">
            <CardContent className="text-center">
              <div className="text-5xl mb-4">📋</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">暂无进行中的训练计划</h3>
              <p className="text-gray-500 mb-4">完成AI评估后，系统将为您推荐个性化训练方案</p>
              <Link href="/assessment">
                <Button>开始AI评估</Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Exercise Details */}
      {activePlans.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span>📋</span> 当前计划训练详情 - {activePlans[0].name}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {activePlans[0].exercises.map((exercise, index) => (
                <div
                  key={exercise.id}
                  className={cn(
                    'flex items-center gap-4 p-4 rounded-xl transition-colors',
                    exercise.completed ? 'bg-green-50 border border-green-100' : 'bg-gray-50 hover:bg-gray-100'
                  )}
                >
                  <div className={cn(
                    'w-10 h-10 rounded-xl flex items-center justify-center font-bold',
                    exercise.completed ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-600'
                  )}>
                    {exercise.completed ? '✓' : index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900">{exercise.name}</span>
                      <span className={cn(
                        'px-2 py-0.5 text-xs rounded-full',
                        exercise.difficulty <= 2 ? 'bg-green-50 text-green-600' :
                        exercise.difficulty <= 3 ? 'bg-yellow-50 text-yellow-600' :
                        'bg-red-50 text-red-600'
                      )}>
                        难度 {exercise.difficulty}/5
                      </span>
                    </div>
                    <div className="text-sm text-gray-500 mt-0.5">
                      {exercise.description}
                    </div>
                    <div className="flex gap-4 mt-1 text-xs text-gray-400">
                      <span>⏱️ {Math.floor(exercise.duration / 60)}:{(exercise.duration % 60).toString().padStart(2, '0')}</span>
                      <span>🔄 {exercise.sets}组 × {exercise.reps}次</span>
                      <span>🎯 {exercise.targetArea}</span>
                    </div>
                  </div>
                  {exercise.feedback && (
                    <div className="text-right">
                      <div className="text-lg font-bold text-blue-600">{exercise.feedback.accuracy}%</div>
                      <div className="text-xs text-gray-500">准确率</div>
                    </div>
                  )}
                  {!exercise.completed && (
                    <Link href="/exercise">
                      <Button size="sm">开始</Button>
                    </Link>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
