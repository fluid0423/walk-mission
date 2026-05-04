import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { createMMKV } from "react-native-mmkv";
import type { Mission } from "../types";

const storage = createMMKV({ id: "mission-storage" });

const mmkvStorage = {
  getItem: (name: string) => storage.getString(name) ?? null,
  setItem: (name: string, value: string) => storage.set(name, value),
  removeItem: (name: string) => storage.remove(name),
};

const DAILY_MISSIONS: Mission[] = [
  {
    id: "daily_first_step",
    title: "첫 걸음",
    description: "오늘 첫 발을 내딛어요",
    type: "daily",
    stepTarget: 1,
    reward: 10,
    completed: false,
    rewarded: false,
  },
  {
    id: "daily_3000",
    title: "가볍게 걷기",
    description: "3,000보 걷기",
    type: "daily",
    stepTarget: 3000,
    reward: 50,
    completed: false,
    rewarded: false,
  },
  {
    id: "daily_5000",
    title: "반 목표 달성",
    description: "5,000보 걷기",
    type: "daily",
    stepTarget: 5000,
    reward: 100,
    completed: false,
    rewarded: false,
  },
  {
    id: "daily_10000",
    title: "오늘의 목표 달성!",
    description: "10,000보 걷기",
    type: "daily",
    stepTarget: 10000,
    reward: 200,
    completed: false,
    rewarded: false,
  },
];

const WEEKLY_MISSIONS: Mission[] = [
  {
    id: "weekly_30000",
    title: "주간 챌린지",
    description: "이번 주 총 30,000보 걷기",
    type: "weekly",
    stepTarget: 30000,
    reward: 300,
    completed: false,
    rewarded: false,
  },
  {
    id: "weekly_70000",
    title: "걷기 고수",
    description: "이번 주 총 70,000보 걷기",
    type: "weekly",
    stepTarget: 70000,
    reward: 500,
    completed: false,
    rewarded: false,
  },
];

interface MissionState {
  missions: Mission[];
  lastResetDate: string;
  checkAndResetMissions: () => void;
  updateMissionProgress: (steps: number, weeklySteps: number) => string[];
  claimMission: (id: string) => number;
}

const today = () => new Date().toDateString();

export const useMissionStore = create<MissionState>()(
  persist(
    (set, get) => ({
      missions: [...DAILY_MISSIONS, ...WEEKLY_MISSIONS],
      lastResetDate: today(),

      checkAndResetMissions: () => {
        const { lastResetDate } = get();
        if (today() !== lastResetDate) {
          set((s) => ({
            lastResetDate: today(),
            missions: s.missions.map((m) =>
              m.type === "daily"
                ? { ...m, completed: false, rewarded: false }
                : m
            ),
          }));
        }
      },

      updateMissionProgress: (steps: number, weeklySteps: number) => {
        const completedIds: string[] = [];
        set((s) => ({
          missions: s.missions.map((m) => {
            const target = m.type === "weekly" ? weeklySteps : steps;
            if (!m.completed && target >= m.stepTarget) {
              completedIds.push(m.id);
              return { ...m, completed: true };
            }
            return m;
          }),
        }));
        return completedIds;
      },

      claimMission: (id: string) => {
        let reward = 0;
        set((s) => ({
          missions: s.missions.map((m) => {
            if (m.id === id && m.completed && !m.rewarded) {
              reward = m.reward;
              return { ...m, rewarded: true };
            }
            return m;
          }),
        }));
        return reward;
      },
    }),
    {
      name: "mission-storage",
      storage: createJSONStorage(() => mmkvStorage),
    }
  )
);
