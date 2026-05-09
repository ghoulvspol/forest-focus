'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/Card';
import { Button } from '@/components/Button';
import { CircularProgress } from '@/components/ProgressBar';
import { cn } from '@/lib/utils';

interface FeedbackItem {
  type: 'success' | 'warning' | 'info';
  message: string;
  timestamp: number;
}

const exercises = [
  {
    id: 'e1',
    name: '直腿抬高训练',
    description: '仰卧位，缓慢抬起患肢至45度角，保持5秒后缓慢放下',
    sets: 3,
    reps: 15,
    currentSet: 1,
    currentRep: 0,
    tips: ['保持膝盖伸直', '动作缓慢控制', '感受股四头肌发力'],
  },
  {
    id: 'e2',
    name: '坐位屈膝训练',
    description: '坐于椅子上，缓慢弯曲和伸直膝盖',
    sets: 3,
    reps: 12,
    currentSet: 1,
    currentRep: 0,
    tips: ['不要过度弯曲', '感到轻微拉伸即可', '控制速度'],
  },
  {
    id: 'e3',
    name: '踝泵运动',
    description: '脚踝上下活动，促进血液循环',
    sets: 2,
    reps: 20,
    currentSet: 1,
    currentRep: 0,
    tips: ['用力绷脚尖和勾脚尖', '每个位置保持3秒', '放松脚踝'],
  },
];

export default function ExercisePage() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentRep, setCurrentRep] = useState(0);
  const [currentSet, setCurrentSet] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [timer, setTimer] = useState(0);
  const [accuracy, setAccuracy] = useState(92);
  const [formScore, setFormScore] = useState(88);
  const [feedback, setFeedback] = useState<FeedbackItem[]>([]);
  const [showComplete, setShowComplete] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const feedbackRef = useRef<NodeJS.Timeout | null>(null);

  const currentExercise = exercises[currentIndex];
  const isExerciseComplete = currentSet > currentExercise.sets;
  const totalReps = currentExercise.sets * currentExercise.reps;
  const completedReps = (currentSet - 1) * currentExercise.reps + currentRep;
  const progress = (completedReps / totalReps) * 100;

  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        setTimer(t => t + 1);
      }, 1000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPlaying]);

  useEffect(() => {
    if (isPlaying) {
      feedbackRef.current = setInterval(() => {
        const messages = [
          { type: 'success' as const, message: '姿势标准，继续保持！' },
          { type: 'info' as const, message: '注意保持呼吸均匀' },
          { type: 'success' as const, message: '动作完成度很好' },
          { type: 'warning' as const, message: '膝盖可以再抬高一点' },
          { type: 'success' as const, message: '节奏控制得很好' },
          { type: 'info' as const, message: '感受目标肌肉发力' },
        ];
        const randomFeedback = messages[Math.floor(Math.random() * messages.length)];
        setFeedback(prev => [
          { ...randomFeedback, timestamp: Date.now() },
          ...prev.slice(0, 4),
        ]);
        setAccuracy(a => Math.min(100, Math.max(70, a + (Math.random() - 0.5) * 6)));
        setFormScore(f => Math.min(100, Math.max(70, f + (Math.random() - 0.5) * 4)));
      }, 3000);
    }
    return () => {
      if (feedbackRef.current) clearInterval(feedbackRef.current);
    };
  }, [isPlaying]);

  const handleRepComplete = () => {
    if (currentRep < currentExercise.reps) {
      setCurrentRep(r => r + 1);
    }
    if (currentRep + 1 >= currentExercise.reps) {
      if (currentSet < currentExercise.sets) {
        setCurrentSet(s => s + 1);
        setCurrentRep(0);
      } else {
        if (currentIndex < exercises.length - 1) {
          setCurrentIndex(i => i + 1);
          setCurrentSet(1);
          setCurrentRep(0);
        } else {
          setShowComplete(true);
          setIsPlaying(false);
        }
      }
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (showComplete) {
    return (
      <div className="space-y-8 animate-fade-in">
        <Card className="text-center py-12 border-green-200 bg-gradient-to-br from-green-50 to-blue-50">
          <CardContent>
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">训练完成！</h2>
            <p className="text-gray-500 mb-8">恭喜你完成了今天的康复训练</p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto mb-8">
              <div className="p-4 bg-white rounded-xl shadow-sm">
                <div className="text-2xl font-bold text-blue-600">{formatTime(timer)}</div>
                <div className="text-sm text-gray-500">训练时长</div>
              </div>
              <div className="p-4 bg-white rounded-xl shadow-sm">
                <div className="text-2xl font-bold text-green-600">{exercises.length}</div>
                <div className="text-sm text-gray-500">完成动作</div>
              </div>
              <div className="p-4 bg-white rounded-xl shadow-sm">
                <div className="text-2xl font-bold text-purple-600">{Math.round(accuracy)}%</div>
                <div className="text-sm text-gray-500">平均准确率</div>
              </div>
              <div className="p-4 bg-white rounded-xl shadow-sm">
                <div className="text-2xl font-bold text-orange-600">+85</div>
                <div className="text-sm text-gray-500">获得经验</div>
              </div>
            </div>

            <div className="flex justify-center gap-3">
              <Button size="lg" onClick={() => window.location.href = '/'}>
                返回首页
              </Button>
              <Button size="lg" variant="outline" onClick={() => window.location.href = '/progress'}>
                查看报告
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">实时训练</h1>
          <p className="text-gray-500">
            动作 {currentIndex + 1}/{exercises.length} · 第 {currentSet} 组
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-2xl font-bold text-blue-600">{formatTime(timer)}</div>
            <div className="text-xs text-gray-500">训练时长</div>
          </div>
          <CircularProgress value={accuracy} color="#22c55e" size={60} strokeWidth={6}>
            <span className="text-sm font-bold text-green-600">{Math.round(accuracy)}%</span>
          </CircularProgress>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Exercise Display */}
        <div className="lg:col-span-2">
          <Card className="overflow-hidden">
            <div className="relative bg-gradient-to-br from-blue-600 to-purple-700 aspect-video flex items-center justify-center">
              <div className="text-center text-white">
                <div className="text-6xl mb-4">🏋️</div>
                <div className="text-xl font-bold">{currentExercise.name}</div>
                <div className="text-blue-200 mt-2">{currentExercise.description}</div>
              </div>
              {isPlaying && (
                <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm rounded-full px-3 py-1.5 text-white text-sm animate-pulse">
                  🔴 正在记录
                </div>
              )}
            </div>
            <CardContent>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="text-sm text-gray-500">
                    第 {currentSet}/{currentExercise.sets} 组 · {currentRep}/{currentExercise.reps} 次
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2 mt-2">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  {!isPlaying ? (
                    <Button onClick={() => setIsPlaying(true)} icon={<span>▶️</span>}>
                      开始训练
                    </Button>
                  ) : (
                    <>
                      <Button variant="outline" onClick={() => setIsPlaying(false)}>
                        ⏸️ 暂停
                      </Button>
                      <Button onClick={handleRepComplete}>
                        ✅ 完成一次
                      </Button>
                    </>
                  )}
                </div>
              </div>

              {/* Tips */}
              <div className="flex flex-wrap gap-2">
                {currentExercise.tips.map((tip, i) => (
                  <span key={i} className="px-3 py-1.5 bg-blue-50 text-blue-700 text-sm rounded-lg">
                    💡 {tip}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Feedback Panel */}
        <div className="space-y-6">
          {/* Real-time Scores */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <span>📊</span> 实时评分
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">动作准确率</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-green-500 rounded-full transition-all"
                        style={{ width: `${accuracy}%` }}
                      />
                    </div>
                    <span className="text-sm font-bold text-green-600">{Math.round(accuracy)}%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">姿势评分</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 rounded-full transition-all"
                        style={{ width: `${formScore}%` }}
                      />
                    </div>
                    <span className="text-sm font-bold text-blue-600">{Math.round(formScore)}%</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* AI Feedback */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <span>🤖</span> AI实时指导
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {feedback.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    <div className="text-3xl mb-2">💬</div>
                    <p className="text-sm">开始训练后将显示实时反馈</p>
                  </div>
                ) : (
                  feedback.map((item, i) => (
                    <div
                      key={item.timestamp}
                      className={cn(
                        'p-3 rounded-lg text-sm animate-slide-up',
                        item.type === 'success' ? 'bg-green-50 text-green-700' :
                        item.type === 'warning' ? 'bg-yellow-50 text-yellow-700' :
                        'bg-blue-50 text-blue-700'
                      )}
                    >
                      <span className="mr-2">
                        {item.type === 'success' ? '✅' : item.type === 'warning' ? '⚠️' : '💡'}
                      </span>
                      {item.message}
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Exercise Queue */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <span>📋</span> 训练队列
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {exercises.map((ex, i) => (
                  <div
                    key={ex.id}
                    className={cn(
                      'flex items-center gap-3 p-2.5 rounded-lg',
                      i === currentIndex ? 'bg-blue-50 border border-blue-200' :
                      i < currentIndex ? 'bg-green-50' : 'bg-gray-50'
                    )}
                  >
                    <div className={cn(
                      'w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold',
                      i === currentIndex ? 'bg-blue-500 text-white' :
                      i < currentIndex ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'
                    )}>
                      {i < currentIndex ? '✓' : i + 1}
                    </div>
                    <div className="flex-1 text-sm">
                      <div className={cn(
                        'font-medium',
                        i === currentIndex ? 'text-blue-700' : 'text-gray-700'
                      )}>
                        {ex.name}
                      </div>
                      <div className="text-xs text-gray-400">
                        {ex.sets}组 × {ex.reps}次
                      </div>
                    </div>
                    {i === currentIndex && (
                      <span className="text-xs text-blue-600 font-medium">进行中</span>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
