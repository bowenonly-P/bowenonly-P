
export enum Gender {
  Male = 'Male',
  Female = 'Female'
}

export enum ActivityLevel {
  Sedentary = '久坐 (无运动)',
  Light = '轻度活跃 (每周1-3次)',
  Moderate = '中度活跃 (每周3-5次)',
  High = '高度活跃 (每周6-7次)',
  Athlete = '专业/高强度 (每日双练)'
}

export enum CarbType {
  High = '高碳日',
  Medium = '中碳日',
  Low = '低碳日'
}

export type DayPreferenceType = CarbType | '自动';

export interface WeeklyPreference {
  [key: string]: DayPreferenceType; // e.g., "Monday": "High", "Tuesday": "Auto"
}

export interface UserStats {
  age: number;
  gender: Gender;
  height: number; // cm
  weight: number; // kg
  bodyFat: number; // %
  activityLevel: ActivityLevel;
  trainingDays: number;
  targetBodyFat: number;
  targetWeeks: number;
  weeklyPreferences?: WeeklyPreference;
}

export interface Macros {
  protein: number;
  carbs: number;
  fat: number;
  calories: number;
}

export interface DailyPlan {
  dayName: string; // e.g., "Monday"
  carbType: CarbType;
  trainingFocus: string; // e.g., "Heavy Legs", "Rest", "HIIT"
  macros: Macros;
  meals: string[]; // Simple suggestions
  tips: string;
}

export interface FullPlan {
  weeklySchedule: DailyPlan[];
  summary: string;
  advice: string;
}

export interface DailyLog {
  date: string;
  weight: number;
  bodyFat?: number;
  waist?: number;
  hips?: number;
  energyLevel: number; // 1-10
  completedPlan: boolean;
}

export interface SavedProfile {
  id: string;
  name: string;
  userStats: UserStats;
  plan: FullPlan;
  templates?: Partial<Record<CarbType, DailyPlan>>; // Store original day templates
  recommendedCounts?: Partial<Record<CarbType, number>>; // Store original count of days for validation
  logs: DailyLog[];
  createdAt: number;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}
