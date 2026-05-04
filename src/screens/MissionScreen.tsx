import React from "react";
import { View, Text, ScrollView, TouchableOpacity, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useMissionStore } from "../store/useMissionStore";
import { useStepStore } from "../store/useStepStore";
import type { Mission } from "../types";

function MissionItem({ mission, steps, weeklySteps, onClaim }: {
  mission: Mission;
  steps: number;
  weeklySteps: number;
  onClaim: (id: string) => void;
}) {
  const currentSteps = mission.type === "weekly" ? weeklySteps : steps;
  const progress = Math.min(currentSteps / mission.stepTarget, 1);
  const progressPercent = Math.round(progress * 100);

  return (
    <View className="bg-white rounded-2xl p-4 mb-3 shadow-sm">
      <View className="flex-row justify-between items-start mb-2">
        <View className="flex-1">
          <Text className="text-gray-900 font-semibold text-base">{mission.title}</Text>
          <Text className="text-gray-400 text-sm">{mission.description}</Text>
        </View>
        <View className="bg-accent/10 px-2 py-1 rounded-full ml-2">
          <Text className="text-accent text-xs font-bold">+{mission.reward}P</Text>
        </View>
      </View>

      {/* 진행 바 */}
      <View className="bg-gray-100 rounded-full h-2 mb-2">
        <View
          className={`h-2 rounded-full ${mission.rewarded ? "bg-gray-300" : "bg-primary"}`}
          style={{ width: `${progressPercent}%` }}
        />
      </View>

      <View className="flex-row justify-between items-center">
        <Text className="text-gray-400 text-xs">
          {currentSteps.toLocaleString()} / {mission.stepTarget.toLocaleString()}보 ({progressPercent}%)
        </Text>
        {mission.completed && !mission.rewarded && (
          <TouchableOpacity
            className="bg-primary px-3 py-1.5 rounded-full"
            onPress={() => onClaim(mission.id)}
          >
            <Text className="text-white text-xs font-bold">보상 받기</Text>
          </TouchableOpacity>
        )}
        {mission.rewarded && (
          <View className="flex-row items-center gap-1">
            <Text className="text-primary text-xs font-bold">✓ 완료</Text>
          </View>
        )}
      </View>
    </View>
  );
}

export default function MissionScreen() {
  const { missions, claimMission } = useMissionStore();
  const { todaySteps, weeklyRecords, addPoints } = useStepStore();

  const weeklySteps = weeklyRecords.reduce((sum, r) => sum + r.steps, 0) + todaySteps;
  const dailyMissions = missions.filter((m) => m.type === "daily");
  const weeklyMissions = missions.filter((m) => m.type === "weekly");

  const completedCount = missions.filter((m) => m.rewarded).length;
  const totalCount = missions.length;

  const handleClaim = (id: string) => {
    const reward = claimMission(id);
    if (reward > 0) {
      addPoints(reward);
      Alert.alert("🎉 보상 획득!", `${reward}P를 획득했어요!`);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-surface">
      <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
        {/* 헤더 */}
        <View className="pt-4 pb-2">
          <Text className="text-gray-900 text-xl font-bold">미션</Text>
          <Text className="text-gray-400 text-sm">{completedCount}/{totalCount} 완료</Text>
        </View>

        {/* 진행 요약 */}
        <View className="bg-primary/10 rounded-2xl px-4 py-3 mb-6">
          <View className="bg-gray-200 rounded-full h-2 mb-1">
            <View
              className="bg-primary h-2 rounded-full"
              style={{ width: `${Math.round((completedCount / totalCount) * 100)}%` }}
            />
          </View>
          <Text className="text-primary-dark text-xs text-right font-medium">
            {Math.round((completedCount / totalCount) * 100)}% 달성
          </Text>
        </View>

        {/* 일일 미션 */}
        <Text className="text-gray-700 font-bold text-base mb-3">📅 오늘의 미션</Text>
        {dailyMissions.map((m) => (
          <MissionItem
            key={m.id}
            mission={m}
            steps={todaySteps}
            weeklySteps={weeklySteps}
            onClaim={handleClaim}
          />
        ))}

        {/* 주간 미션 */}
        <Text className="text-gray-700 font-bold text-base mt-4 mb-3">🏆 주간 미션</Text>
        {weeklyMissions.map((m) => (
          <MissionItem
            key={m.id}
            mission={m}
            steps={todaySteps}
            weeklySteps={weeklySteps}
            onClaim={handleClaim}
          />
        ))}

        <View className="h-6" />
      </ScrollView>
    </SafeAreaView>
  );
}
