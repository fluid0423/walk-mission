import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { createMMKV } from "react-native-mmkv";
import type { DailyRecord } from "../types";

const storage = createMMKV({ id: "step-storage" });

const mmkvStorage = {
  getItem: (name: string) => storage.getString(name) ?? null,
  setItem: (name: string, value: string) => storage.set(name, value),
  removeItem: (name: string) => storage.remove(name),
};

interface StepState {
  todaySteps: number;
  dailyGoal: number;
  totalPoints: number;
  lastActiveDate: string;
  weeklyRecords: DailyRecord[];
  setTodaySteps: (steps: number) => void;
  setDailyGoal: (goal: number) => void;
  addPoints: (points: number) => void;
  checkAndResetForNewDay: () => void;
  saveTodayRecord: () => void;
}

const today = () => new Date().toDateString();

export const useStepStore = create<StepState>()(
  persist(
    (set, get) => ({
      todaySteps: 0,
      dailyGoal: 10000,
      totalPoints: 0,
      lastActiveDate: today(),
      weeklyRecords: [],

      setTodaySteps: (steps) => set({ todaySteps: steps }),

      setDailyGoal: (goal) => set({ dailyGoal: goal }),

      addPoints: (points) =>
        set((s) => ({ totalPoints: s.totalPoints + points })),

      checkAndResetForNewDay: () => {
        const { lastActiveDate } = get();
        if (today() !== lastActiveDate) {
          get().saveTodayRecord();
          set({ todaySteps: 0, lastActiveDate: today() });
        }
      },

      saveTodayRecord: () => {
        const { todaySteps, weeklyRecords } = get();
        const record: DailyRecord = { date: today(), steps: todaySteps };
        const filtered = weeklyRecords.filter((r) => r.date !== today());
        const updated = [...filtered, record].slice(-7);
        set({ weeklyRecords: updated });
      },
    }),
    {
      name: "step-storage",
      storage: createJSONStorage(() => mmkvStorage),
    }
  )
);
