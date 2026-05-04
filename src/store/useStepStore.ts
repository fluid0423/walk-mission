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
  dailyRecords: DailyRecord[];
  setTodaySteps: (steps: number) => void;
  setDailyGoal: (goal: number) => void;
  addPoints: (points: number) => void;
  checkAndResetForNewDay: () => void;
  saveTodayRecord: () => void;
  getWeeklySteps: () => number;
}

const todayStr = () => new Date().toISOString().split("T")[0]; // YYYY-MM-DD

export const useStepStore = create<StepState>()(
  persist(
    (set, get) => ({
      todaySteps: 0,
      dailyGoal: 10000,
      totalPoints: 0,
      lastActiveDate: todayStr(),
      dailyRecords: [],

      setTodaySteps: (steps) => set({ todaySteps: steps }),
      setDailyGoal: (goal) => set({ dailyGoal: goal }),
      addPoints: (points) => set((s) => ({ totalPoints: s.totalPoints + points })),

      checkAndResetForNewDay: () => {
        const { lastActiveDate } = get();
        if (todayStr() !== lastActiveDate) {
          get().saveTodayRecord();
          set({ todaySteps: 0, lastActiveDate: todayStr() });
        }
      },

      saveTodayRecord: () => {
        const { todaySteps, dailyRecords = [] } = get();
        if (todaySteps === 0) return;
        const record: DailyRecord = { date: todayStr(), steps: todaySteps };
        const filtered = dailyRecords.filter((r) => r.date !== todayStr());
        const updated = [...filtered, record].slice(-90); // 90일 보관
        set({ dailyRecords: updated });
      },

      getWeeklySteps: () => {
        const { dailyRecords = [], todaySteps } = get();
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        const weekStr = weekAgo.toISOString().split("T")[0];
        return (
          dailyRecords
            .filter((r) => r.date >= weekStr)
            .reduce((sum, r) => sum + r.steps, 0) + todaySteps
        );
      },
    }),
    {
      name: "step-storage",
      storage: createJSONStorage(() => mmkvStorage),
      migrate: (persisted: any) => {
        // weeklyRecords → dailyRecords 마이그레이션
        if (persisted?.weeklyRecords && !persisted?.dailyRecords) {
          persisted.dailyRecords = persisted.weeklyRecords;
          delete persisted.weeklyRecords;
        }
        if (!persisted?.dailyRecords) persisted.dailyRecords = [];
        return persisted;
      },
      version: 1,
    }
  )
);
