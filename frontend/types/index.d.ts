export interface Profile {
  name: string;
  age: number;
  height: number;
  weight_goal: number;
  fitness_goal: string;
  start_date: string;
}

export interface Log {
  date: string;
  workout_done: boolean;
  duration: number;
  weight: number;
  mood: number;
  notes: string;
}

export interface PlanItem {
  day: string;
  activity: string;
}

export interface Decision {
  reasoning: string;
  created_at: string;
}
