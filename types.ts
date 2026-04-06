
export enum AgeGroup {
  CHILDREN = 'Children (8-14)',
  YOUNG_ADULTS = 'Young Adults (15-30)',
  ADULTS = 'Adults (31-50)',
  SENIORS = 'Seniors (51+)'
}

export enum Gender {
  MALE = 'Male',
  FEMALE = 'Female',
  OTHER = 'Other'
}

export enum DietaryPreference {
  VEGETARIAN = 'Vegetarian',
  NON_VEGETARIAN = 'Non-Vegetarian'
}

export enum ActivityLevel {
  SEDENTARY = 'Sedentary (Office job)',
  LIGHT = 'Light (1-2 days/week)',
  MODERATE = 'Moderate (3-5 days/week)',
  ACTIVE = 'Active (6-7 days/week)',
  VERY_ACTIVE = 'Very Active (Physical job)'
}

export enum WeightGoal {
  LOSE = 'Weight Loss',
  MAINTAIN = 'Maintain Weight',
  GAIN = 'Weight Gain'
}

export interface UserProfile {
  age: number;
  height: number;
  weight: number;
  gender: Gender;
  preference: DietaryPreference;
  activityLevel: ActivityLevel;
  goal: WeightGoal;
  ageGroup: AgeGroup;
}

export interface DayPlan {
  breakfast: string;
  lunch: string;
  snacks: string;
  dinner: string;
  healthyFats: string;
}

export interface DietPlan {
  weeklyPlan: Record<string, DayPlan>;
  hydration: string;
  hydrationSchedule: string[];
  totalCalories: number;
  macros: {
    protein: string;
    carbs: string;
    fats: string;
  };
  tips: string[];
}

export interface Exercise {
  id: string;
  name: string;
  description: string;
  benefits: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  duration: string;
  category: 'Warm-up' | 'Main' | 'Cool-down';
  muscleGroup: string;
  calories: number;
}

export interface WorkoutRecord {
  id: string;
  date: string;
  durationMinutes: number;
  exercises: string[];
  totalReps: number;
  ageGroup: AgeGroup;
}

export interface UserState {
  profile: UserProfile | null;
  history: WorkoutRecord[];
  completedWorkouts: number;
  lastWorkoutDate: string | null;
}
