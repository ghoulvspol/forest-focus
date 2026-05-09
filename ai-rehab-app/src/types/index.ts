export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  level: number;
  xp: number;
  xpToNextLevel: number;
  streak: number;
  joinDate: string;
  condition: RehabilitationCondition;
  assessment: Assessment | null;
}

export type RehabilitationCondition =
  | 'knee_replacement'
  | 'acl_reconstruction'
  | 'shoulder_surgery'
  | 'hip_replacement'
  | 'ankle_sprain'
  | 'back_pain'
  | 'sports_injury';

export interface Assessment {
  id: string;
  date: string;
  painLevel: number;
  mobilityScore: number;
  strengthScore: number;
  flexibilityScore: number;
  mentalWellness: number;
  overallScore: number;
  aiRecommendations: string[];
}

export interface TrainingPlan {
  id: string;
  name: string;
  description: string;
  condition: RehabilitationCondition;
  duration: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  exercises: Exercise[];
  progress: number;
  status: 'active' | 'completed' | 'locked';
  isTraditionalChineseMedicine: boolean;
}

export interface Exercise {
  id: string;
  name: string;
  description: string;
  duration: number;
  sets: number;
  reps: number;
  targetArea: string;
  difficulty: number;
  videoUrl?: string;
  tips: string[];
  completed: boolean;
  feedback?: ExerciseFeedback;
}

export interface ExerciseFeedback {
  accuracy: number;
  formScore: number;
  painReported: boolean;
  aiSuggestions: string[];
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  xpReward: number;
  unlockedAt?: string;
  progress: number;
  target: number;
  category: 'training' | 'streak' | 'progress' | 'social' | 'special';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export interface TrainingSession {
  id: string;
  date: string;
  planId: string;
  planName: string;
  exercisesCompleted: number;
  totalExercises: number;
  duration: number;
  caloriesBurned: number;
  averageAccuracy: number;
  painLevel: number;
  mood: 'great' | 'good' | 'okay' | 'bad';
  xpEarned: number;
}

export interface WeeklyStats {
  sessionsCompleted: number;
  totalMinutes: number;
  averageAccuracy: number;
  painReduction: number;
  xpEarned: number;
  streakDays: number;
}

export interface LeaderboardEntry {
  rank: number;
  user: { name: string; avatar: string; level: number };
  xp: number;
  streak: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}
