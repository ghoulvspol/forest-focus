import { User, TrainingPlan, Achievement, TrainingSession, Assessment, LeaderboardEntry } from '@/types';

export const mockUser: User = {
  id: '1',
  name: '李明',
  email: 'liming@example.com',
  avatar: '',
  level: 12,
  xp: 2850,
  xpToNextLevel: 3200,
  streak: 7,
  joinDate: '2026-01-15',
  condition: 'knee_replacement',
  assessment: {
    id: 'a1',
    date: '2026-03-28',
    painLevel: 3,
    mobilityScore: 72,
    strengthScore: 65,
    flexibilityScore: 58,
    mentalWellness: 80,
    overallScore: 69,
    aiRecommendations: [
      '建议增加膝关节屈伸训练频率，每日2次',
      '可适当引入中医穴位按摩辅助康复',
      '心理状态良好，建议保持当前训练节奏',
    ],
  },
};

export const mockAssessmentHistory: Assessment[] = [
  {
    id: 'a1', date: '2026-03-28', painLevel: 3, mobilityScore: 72, strengthScore: 65,
    flexibilityScore: 58, mentalWellness: 80, overallScore: 69,
    aiRecommendations: ['继续当前训练计划', '增加灵活性训练'],
  },
  {
    id: 'a2', date: '2026-03-21', painLevel: 4, mobilityScore: 68, strengthScore: 60,
    flexibilityScore: 55, mentalWellness: 75, overallScore: 65,
    aiRecommendations: ['降低训练强度', '注意休息'],
  },
  {
    id: 'a3', date: '2026-03-14', painLevel: 5, mobilityScore: 62, strengthScore: 55,
    flexibilityScore: 50, mentalWellness: 70, overallScore: 59,
    aiRecommendations: ['需要更多恢复时间', '减少高强度训练'],
  },
  {
    id: 'a4', date: '2026-03-07', painLevel: 6, mobilityScore: 55, strengthScore: 48,
    flexibilityScore: 45, mentalWellness: 65, overallScore: 53,
    aiRecommendations: ['建议就医检查', '以轻度活动为主'],
  },
];

export const mockTrainingPlans: TrainingPlan[] = [
  {
    id: 'tp1',
    name: '膝关节术后康复计划',
    description: '针对膝关节置换术后的综合康复方案，融合现代运动医学和中医经络理论',
    condition: 'knee_replacement',
    duration: 90,
    difficulty: 'intermediate',
    progress: 45,
    status: 'active',
    isTraditionalChineseMedicine: false,
    exercises: [
      { id: 'e1', name: '直腿抬高训练', description: '仰卧位，缓慢抬起患肢至45度角', duration: 300, sets: 3, reps: 15, targetArea: '股四头肌', difficulty: 2, tips: ['保持膝盖伸直', '动作缓慢控制'], completed: true, feedback: { accuracy: 92, formScore: 88, painReported: false, aiSuggestions: ['姿势标准，继续保持'] } },
      { id: 'e2', name: '坐位屈膝训练', description: '坐于椅子上，缓慢弯曲和伸直膝盖', duration: 240, sets: 3, reps: 12, targetArea: '膝关节活动度', difficulty: 2, tips: ['不要过度弯曲', '感到轻微拉伸即可'], completed: true, feedback: { accuracy: 85, formScore: 82, painReported: false, aiSuggestions: ['角度可以再大一些'] } },
      { id: 'e3', name: '平衡站立训练', description: '单腿站立，保持身体平衡', duration: 180, sets: 3, reps: 10, targetArea: '核心稳定性', difficulty: 3, tips: ['可扶墙辅助', '逐渐增加时间'], completed: false },
      { id: 'e4', name: '踝泵运动', description: '脚踝上下活动，促进血液循环', duration: 120, sets: 2, reps: 20, targetArea: '下肢循环', difficulty: 1, tips: ['用力绷脚尖和勾脚尖', '每个位置保持3秒'], completed: false },
    ],
  },
  {
    id: 'tp2',
    name: '中医经络辅助康复',
    description: '结合穴位按摩和传统功法，加速康复进程',
    condition: 'knee_replacement',
    duration: 60,
    difficulty: 'beginner',
    progress: 20,
    status: 'active',
    isTraditionalChineseMedicine: true,
    exercises: [
      { id: 'e5', name: '足三里穴位按摩', description: '按揉足三里穴位，调节脾胃，强健下肢', duration: 300, sets: 2, reps: 30, targetArea: '经络调理', difficulty: 1, tips: ['用拇指按揉', '力度适中有酸胀感'], completed: true, feedback: { accuracy: 90, formScore: 85, painReported: false, aiSuggestions: ['按摩时间可以延长'] } },
      { id: 'e6', name: '八段锦 - 调理脾胃须单举', description: '传统功法，调理脾胃功能', duration: 600, sets: 1, reps: 8, targetArea: '全身调理', difficulty: 2, tips: ['动作缓慢流畅', '配合呼吸'], completed: false },
      { id: 'e7', name: '阳陵泉穴位刺激', description: '按揉阳陵泉，舒筋活络', duration: 240, sets: 2, reps: 25, targetArea: '筋络调理', difficulty: 1, tips: ['找到腓骨小头前下方凹陷处', '轻柔按揉'], completed: false },
    ],
  },
  {
    id: 'tp3',
    name: '高级运动康复训练',
    description: '针对恢复后期的进阶训练，帮助回归运动',
    condition: 'knee_replacement',
    duration: 120,
    difficulty: 'advanced',
    progress: 0,
    status: 'locked',
    isTraditionalChineseMedicine: false,
    exercises: [
      { id: 'e8', name: '深蹲训练', description: '标准深蹲，增强下肢力量', duration: 300, sets: 4, reps: 12, targetArea: '下肢综合', difficulty: 4, tips: ['膝盖不超过脚尖', '保持背部挺直'], completed: false },
      { id: 'e9', name: '侧向移动训练', description: '侧向跨步，提升侧向稳定性', duration: 240, sets: 3, reps: 15, targetArea: '髋关节稳定性', difficulty: 4, tips: ['保持膝盖微屈', '控制移动速度'], completed: false },
    ],
  },
];

export const mockAchievements: Achievement[] = [
  { id: 'a1', name: '初次评估', description: '完成第一次AI智能评估', icon: '🎯', xpReward: 50, unlockedAt: '2026-01-15', progress: 1, target: 1, category: 'training', rarity: 'common' },
  { id: 'a2', name: '坚持不懈', description: '连续7天完成训练', icon: '🔥', xpReward: 200, unlockedAt: '2026-03-28', progress: 7, target: 7, category: 'streak', rarity: 'rare' },
  { id: 'a3', name: '康复先锋', description: '完成10次训练课程', icon: '⭐', xpReward: 150, unlockedAt: '2026-03-20', progress: 10, target: 10, category: 'training', rarity: 'common' },
  { id: 'a4', name: '疼痛克星', description: '疼痛等级降低3级以上', icon: '💪', xpReward: 300, unlockedAt: '2026-03-25', progress: 3, target: 3, category: 'progress', rarity: 'epic' },
  { id: 'a5', name: '中医达人', description: '完成5次中医康复训练', icon: '🏥', xpReward: 150, progress: 3, target: 5, category: 'training', rarity: 'rare' },
  { id: 'a6', name: '完美动作', description: '获得10次95分以上的动作评分', icon: '💎', xpReward: 250, progress: 6, target: 10, category: 'training', rarity: 'epic' },
  { id: 'a7', name: '月度冠军', description: '月度训练时长排名第一', icon: '👑', xpReward: 500, progress: 0, target: 1, category: 'social', rarity: 'legendary' },
  { id: 'a8', name: '康复里程碑', description: '整体康复进度达到50%', icon: '🏆', xpReward: 400, progress: 45, target: 50, category: 'progress', rarity: 'epic' },
];

export const mockTrainingHistory: TrainingSession[] = [
  { id: 's1', date: '2026-03-28', planId: 'tp1', planName: '膝关节术后康复计划', exercisesCompleted: 4, totalExercises: 4, duration: 25, caloriesBurned: 120, averageAccuracy: 88, painLevel: 3, mood: 'good', xpEarned: 85 },
  { id: 's2', date: '2026-03-27', planId: 'tp2', planName: '中医经络辅助康复', exercisesCompleted: 2, totalExercises: 3, duration: 18, caloriesBurned: 60, averageAccuracy: 90, painLevel: 3, mood: 'great', xpEarned: 65 },
  { id: 's3', date: '2026-03-26', planId: 'tp1', planName: '膝关节术后康复计划', exercisesCompleted: 4, totalExercises: 4, duration: 28, caloriesBurned: 135, averageAccuracy: 85, painLevel: 4, mood: 'okay', xpEarned: 80 },
  { id: 's4', date: '2026-03-25', planId: 'tp1', planName: '膝关节术后康复计划', exercisesCompleted: 3, totalExercises: 4, duration: 20, caloriesBurned: 95, averageAccuracy: 82, painLevel: 4, mood: 'good', xpEarned: 60 },
  { id: 's5', date: '2026-03-24', planId: 'tp2', planName: '中医经络辅助康复', exercisesCompleted: 3, totalExercises: 3, duration: 22, caloriesBurned: 70, averageAccuracy: 92, painLevel: 3, mood: 'great', xpEarned: 75 },
];

export const mockLeaderboard: LeaderboardEntry[] = [
  { rank: 1, user: { name: '张伟', avatar: '', level: 18 }, xp: 5200, streak: 21 },
  { rank: 2, user: { name: '王芳', avatar: '', level: 16 }, xp: 4800, streak: 14 },
  { rank: 3, user: { name: '刘洋', avatar: '', level: 15 }, xp: 4350, streak: 12 },
  { rank: 4, user: { name: '陈静', avatar: '', level: 14 }, xp: 3900, streak: 10 },
  { rank: 5, user: { name: '李明', avatar: '', level: 12 }, xp: 2850, streak: 7 },
  { rank: 6, user: { name: '赵丽', avatar: '', level: 11 }, xp: 2600, streak: 5 },
  { rank: 7, user: { name: '孙强', avatar: '', level: 10 }, xp: 2200, streak: 8 },
];

export const weeklyStatsData = {
  sessionsCompleted: 5,
  totalMinutes: 113,
  averageAccuracy: 87,
  painReduction: 25,
  xpEarned: 365,
  streakDays: 7,
};
