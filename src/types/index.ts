export interface Mission {
  id: string;
  title: string;
  description: string;
  type: "daily" | "weekly";
  stepTarget: number;
  reward: number;
  completed: boolean;
  rewarded: boolean;
}

export interface DailyRecord {
  date: string;
  steps: number;
}
