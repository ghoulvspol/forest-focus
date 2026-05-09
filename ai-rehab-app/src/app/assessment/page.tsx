'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/Card';
import { Button } from '@/components/Button';
import { ProgressBar, CircularProgress } from '@/components/ProgressBar';
import { mockUser, mockAssessmentHistory } from '@/lib/mock-data';
import { cn, formatDate } from '@/lib/utils';

type AssessmentStep = 'intro' | 'pain' | 'mobility' | 'strength' | 'mental' | 'analyzing' | 'results';

export default function AssessmentPage() {
  const [step, setStep] = useState<AssessmentStep>('intro');
  const [painLevel, setPainLevel] = useState(3);
  const [mobilityAnswers, setMobilityAnswers] = useState<Record<string, number>>({});
  const [strengthAnswers, setStrengthAnswers] = useState<Record<string, number>>({});
  const [mentalScore, setMentalScore] = useState(7);

  const startAssessment = () => setStep('pain');

  const simulateAnalysis = () => {
    setStep('analyzing');
    setTimeout(() => setStep('results'), 3000);
  };

  const currentAssessment = mockUser.assessment;

  const mobilityTests = [
    { id: 'm1', name: '膝关节屈曲', description: '尝试弯曲膝盖到最大程度', score: mobilityAnswers['m1'] || 0 },
    { id: 'm2', name: '膝关节伸展', description: '尝试完全伸直膝盖', score: mobilityAnswers['m2'] || 0 },
    { id: 'm3', name: '步态行走', description: '正常行走10步观察稳定性', score: mobilityAnswers['m3'] || 0 },
    { id: 'm4', name: '上下楼梯', description: '尝试上下一级台阶', score: mobilityAnswers['m4'] || 0 },
  ];

  const strengthTests = [
    { id: 's1', name: '直腿抬高', description: '仰卧抬腿保持10秒', score: strengthAnswers['s1'] || 0 },
    { id: 's2', name: '坐位伸膝', description: '坐位完全伸直膝盖', score: strengthAnswers['s2'] || 0 },
    { id: 's3', name: '站立平衡', description: '单腿站立保持平衡', score: strengthAnswers['s3'] || 0 },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">AI智能评估</h1>
        <p className="text-gray-500 mt-1">多维度评估您的康复状态，AI生成个性化康复方案</p>
      </div>

      {step === 'intro' && (
        <div className="space-y-6">
          {/* Current Assessment Summary */}
          {currentAssessment && (
            <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-green-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span>📊</span> 最近评估结果
                  <span className="text-sm font-normal text-gray-500">
                    ({formatDate(currentAssessment.date)})
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <CircularProgress value={currentAssessment.overallScore} color="#3B82F6" size={100} strokeWidth={8}>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{currentAssessment.overallScore}</div>
                      <div className="text-xs text-gray-500">总分</div>
                    </div>
                  </CircularProgress>
                  <div className="space-y-3">
                    <ProgressBar value={currentAssessment.mobilityScore} label="活动度" color="green" size="sm" />
                    <ProgressBar value={currentAssessment.strengthScore} label="力量" color="blue" size="sm" />
                  </div>
                  <div className="space-y-3">
                    <ProgressBar value={currentAssessment.flexibilityScore} label="柔韧性" color="purple" size="sm" />
                    <ProgressBar value={currentAssessment.mentalWellness} label="心理状态" color="yellow" size="sm" />
                  </div>
                  <div className="col-span-2 p-4 bg-white rounded-xl">
                    <div className="text-sm font-medium text-gray-700 mb-2">AI建议</div>
                    {currentAssessment.aiRecommendations.map((rec, i) => (
                      <div key={i} className="flex items-start gap-2 text-sm text-gray-600 mb-2">
                        <span>{i === 0 ? '💡' : i === 1 ? '📌' : '✨'}</span>
                        <span>{rec}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Start New Assessment */}
          <Card>
            <CardContent className="py-12 text-center">
              <div className="text-6xl mb-4">🎯</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">开始新的AI评估</h2>
              <p className="text-gray-500 max-w-md mx-auto mb-6">
                通过多维度评估，AI将分析您的疼痛程度、关节活动度、肌肉力量和心理状态，
                为您生成最新的个性化康复方案。
              </p>
              <div className="flex justify-center gap-3">
                <Button size="lg" onClick={startAssessment}>
                  开始评估
                </Button>
                <Button size="lg" variant="outline" onClick={() => setStep('results')}>
                  查看历史报告
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Assessment History */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span>📈</span> 评估历史趋势
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockAssessmentHistory.map((assessment, index) => (
                  <div
                    key={assessment.id}
                    className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                  >
                    <CircularProgress value={assessment.overallScore} color="#3B82F6" size={60} strokeWidth={5}>
                      <span className="text-sm font-bold">{assessment.overallScore}</span>
                    </CircularProgress>
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{formatDate(assessment.date)}</div>
                      <div className="flex gap-4 mt-1">
                        <span className="text-xs text-gray-500">疼痛: {assessment.painLevel}/10</span>
                        <span className="text-xs text-gray-500">活动度: {assessment.mobilityScore}%</span>
                        <span className="text-xs text-gray-500">力量: {assessment.strengthScore}%</span>
                      </div>
                    </div>
                    <div className={cn(
                      'px-3 py-1 rounded-full text-xs font-medium',
                      index === 0 ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-600'
                    )}>
                      {index === 0 ? '最新' : `${index * 7}天前`}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {step === 'pain' && (
        <Card className="animate-slide-up">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span>😣</span> 疼痛评估
              <span className="text-sm font-normal text-gray-400 ml-auto">步骤 1/4</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-6">请描述您当前的疼痛程度（0=无痛，10=剧烈疼痛）</p>
            <div className="flex justify-between mb-2 text-sm text-gray-500">
              <span>无痛</span>
              <span>剧烈疼痛</span>
            </div>
            <input
              type="range"
              min="0"
              max="10"
              value={painLevel}
              onChange={(e) => setPainLevel(parseInt(e.target.value))}
              className="w-full h-3 rounded-full appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, #22c55e 0%, #eab308 50%, #ef4444 100%)`
              }}
            />
            <div className="flex justify-between mt-2">
              {[0,1,2,3,4,5,6,7,8,9,10].map(n => (
                <button
                  key={n}
                  onClick={() => setPainLevel(n)}
                  className={cn(
                    'w-8 h-8 rounded-full text-sm font-medium transition-all',
                    painLevel === n
                      ? 'bg-blue-500 text-white scale-110'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  )}
                >
                  {n}
                </button>
              ))}
            </div>
            <div className="mt-8 p-4 bg-gray-50 rounded-xl">
              <div className="text-sm text-gray-600">
                当前疼痛等级: <span className="font-bold text-lg text-blue-600">{painLevel}</span>
                <span className="text-gray-400 ml-2">
                  ({painLevel <= 2 ? '轻微' : painLevel <= 5 ? '中等' : painLevel <= 7 ? '较重' : '剧烈'})
                </span>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <Button variant="outline" onClick={() => setStep('intro')}>返回</Button>
              <Button onClick={() => setStep('mobility')}>下一步</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 'mobility' && (
        <Card className="animate-slide-up">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span>🦵</span> 关节活动度评估
              <span className="text-sm font-normal text-gray-400 ml-auto">步骤 2/4</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-6">请根据实际情况评估以下动作的完成程度</p>
            <div className="space-y-4">
              {mobilityTests.map((test) => (
                <div key={test.id} className="p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <div className="font-medium text-gray-900">{test.name}</div>
                      <div className="text-sm text-gray-500">{test.description}</div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {[1,2,3,4,5].map(score => (
                      <button
                        key={score}
                        onClick={() => setMobilityAnswers(prev => ({ ...prev, [test.id]: score }))}
                        className={cn(
                          'flex-1 py-2 rounded-lg text-sm font-medium transition-all',
                          test.score === score
                            ? 'bg-blue-500 text-white'
                            : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                        )}
                      >
                        {score === 1 ? '很差' : score === 2 ? '较差' : score === 3 ? '一般' : score === 4 ? '良好' : '优秀'}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <Button variant="outline" onClick={() => setStep('pain')}>上一步</Button>
              <Button onClick={() => setStep('strength')}>下一步</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 'strength' && (
        <Card className="animate-slide-up">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span>💪</span> 肌肉力量评估
              <span className="text-sm font-normal text-gray-400 ml-auto">步骤 3/4</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-6">请评估以下力量测试的完成情况</p>
            <div className="space-y-4">
              {strengthTests.map((test) => (
                <div key={test.id} className="p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <div className="font-medium text-gray-900">{test.name}</div>
                      <div className="text-sm text-gray-500">{test.description}</div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {[1,2,3,4,5].map(score => (
                      <button
                        key={score}
                        onClick={() => setStrengthAnswers(prev => ({ ...prev, [test.id]: score }))}
                        className={cn(
                          'flex-1 py-2 rounded-lg text-sm font-medium transition-all',
                          test.score === score
                            ? 'bg-blue-500 text-white'
                            : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                        )}
                      >
                        {score === 1 ? '无法完成' : score === 2 ? '勉强' : score === 3 ? '一般' : score === 4 ? '良好' : '轻松'}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <Button variant="outline" onClick={() => setStep('mobility')}>上一步</Button>
              <Button onClick={() => setStep('mental')}>下一步</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 'mental' && (
        <Card className="animate-slide-up">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span>🧠</span> 心理状态评估
              <span className="text-sm font-normal text-gray-400 ml-auto">步骤 4/4</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-6">请评估您当前的整体心理状态和康复信心</p>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">整体心情</label>
                <div className="flex gap-3">
                  {['😔', '😐', '🙂', '😊', '😄'].map((emoji, i) => (
                    <button
                      key={i}
                      onClick={() => setMentalScore(i * 2 + 1)}
                      className={cn(
                        'w-14 h-14 rounded-xl text-2xl transition-all',
                        mentalScore === i * 2 + 1
                          ? 'bg-blue-100 ring-2 ring-blue-500 scale-110'
                          : 'bg-gray-50 hover:bg-gray-100'
                      )}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  康复信心指数: {mentalScore}/10
                </label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={mentalScore}
                  onChange={(e) => setMentalScore(parseInt(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>信心不足</span>
                  <span>充满信心</span>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <Button variant="outline" onClick={() => setStep('strength')}>上一步</Button>
              <Button onClick={simulateAnalysis}>提交评估</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 'analyzing' && (
        <Card className="py-16">
          <CardContent className="text-center">
            <div className="relative w-32 h-32 mx-auto mb-6">
              <CircularProgress value={75} color="#3B82F6" size={128} strokeWidth={8}>
                <div className="text-4xl animate-pulse">🧠</div>
              </CircularProgress>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">AI正在分析您的数据...</h2>
            <p className="text-gray-500">基于多维度评估数据生成个性化康复方案</p>
            <div className="mt-6 space-y-2 max-w-xs mx-auto">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span className="animate-spin">⚙️</span> 分析疼痛模式
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span className="animate-spin">⚙️</span> 评估关节活动度
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span className="animate-spin">⚙️</span> 生成康复建议
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 'results' && (
        <div className="space-y-6 animate-slide-up">
          <Card className="border-green-200 bg-gradient-to-r from-green-50 to-blue-50">
            <CardContent className="py-8 text-center">
              <div className="text-5xl mb-4">✅</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">评估完成！</h2>
              <p className="text-gray-500">AI已根据您的数据生成个性化康复方案</p>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>📊 评估结果</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-center mb-6">
                  <CircularProgress value={currentAssessment?.overallScore || 72} color="#22c55e" size={150} strokeWidth={12}>
                    <div className="text-center">
                      <div className="text-4xl font-bold text-green-600">{currentAssessment?.overallScore || 72}</div>
                      <div className="text-sm text-gray-500">总分</div>
                    </div>
                  </CircularProgress>
                </div>
                <div className="space-y-3">
                  <ProgressBar value={painLevel <= 3 ? 80 : painLevel <= 6 ? 55 : 30} label="疼痛管理" color="green" />
                  <ProgressBar value={currentAssessment?.mobilityScore || 72} label="关节活动度" color="blue" />
                  <ProgressBar value={currentAssessment?.strengthScore || 65} label="肌肉力量" color="purple" />
                  <ProgressBar value={mentalScore * 10} label="心理状态" color="yellow" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>🤖 AI康复建议</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                    <div className="font-medium text-blue-900 mb-1">💡 核心建议</div>
                    <p className="text-sm text-blue-700">
                      建议以膝关节屈伸训练为主，每日2次，每次15-20分钟。配合中医穴位按摩加速恢复。
                    </p>
                  </div>
                  <div className="p-4 bg-green-50 rounded-xl border border-green-100">
                    <div className="font-medium text-green-900 mb-1">📌 训练重点</div>
                    <p className="text-sm text-green-700">
                      重点加强股四头肌力量训练，改善膝关节稳定性。建议从初级难度开始。
                    </p>
                  </div>
                  <div className="p-4 bg-purple-50 rounded-xl border border-purple-100">
                    <div className="font-medium text-purple-900 mb-1">✨ 康复目标</div>
                    <p className="text-sm text-purple-700">
                      预计4周内疼痛等级降低至2以下，8周内恢复正常行走能力。
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-center gap-3">
            <Button size="lg" onClick={() => setStep('intro')}>
              查看评估详情
            </Button>
            <Button size="lg" variant="outline" onClick={() => window.location.href = '/training'}>
              查看推荐训练计划
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
