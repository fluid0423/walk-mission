import React from "react";
import { View, Text, ScrollView, TouchableOpacity, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useMissionStore } from "../store/useMissionStore";
import { useStepStore } from "../store/useStepStore";
import type { Mission } from "../types";

function MissionCard({ mission, currentSteps, onClaim }: {
  mission: Mission;
  currentSteps: number;
  onClaim: (id: string) => void;
}) {
  const progress = Math.min(currentSteps / mission.stepTarget, 1);
  const pct = Math.round(progress * 100);

  const statusColor = mission.rewarded
    ? "bg-slate-100"
    : mission.completed
    ? "bg-emerald-50 border border-emerald-200"
    : "bg-white";

  return (
    <View
      className={`${statusColor} rounded-2xl p-4 mb-3`}
      style={{ elevation: mission.rewarded ? 0 : 2 }}
    >
      <View className="flex-row justify-between items-start mb-3">
        <View className="flex-1 mr-3">
          <Text className={`font-bold text-base ${mission.rewarded ? "text-slate-400" : "text-slate-900"}`}>
            {mission.title}
          </Text>
          <Text className="text-slate-400 text-sm mt-0.5">{mission.description}</Text>
        </View>
        <View className={`px-2.5 py-1 rounded-full ${mission.rewarded ? "bg-slate-200" : "bg-amber-100"}`}>
          <Text className={`text-xs font-bold ${mission.rewarded ? "text-slate-400" : "text-amber-600"}`}>
            +{mission.reward}P
          </Text>
        </View>
      </View>

      {/* 진행 바 */}
      <View className="bg-slate-100 rounded-full h-1.5 mb-2">
        <View
          className={`h-1.5 rounded-full ${mission.rewarded ? "bg-slate-300" : "bg-emerald-500"}`}
          style={{ width: `${pct}%` }}
        />
      </View>

      <View className="flex-row justify-between items-center">
        <Text className="text-slate-400 text-xs">
          {currentSteps.toLocaleString()} / {mission.stepTarget.toLocaleString()}보
        </Text>
        {mission.completed && !mission.rewarded ? (
          <TouchableOpacity
            className="bg-emerald-500 px-4 py-1.5 rounded-full"
            onPress={() => onClaim(mission.id)}
          >
            <Text className="text-white text-xs font-bold">받기</Text>
          </TouchableOpacity>
        ) : mission.rewarded ? (
          <Text className="text-emerald-500 text-xs font-semibold">✓ 완료</Text>
        ) : (
          <Text className="text-slate-400 text-xs font-medium">{pct}%</Text>
        )}
      </View>
    </View>
  );
}

export default function MissionScreen() {
  const { missions, claimMission } = useMissionStore();
  const { todaySteps, getWeeklySteps, addPoints } = useStepStore();
  const weeklySteps = getWeeklySteps();

  const daily = missions.filter((m) => m.type === "daily");
  const weekly = missions.filter((m) => m.type === "weekly");
  const rewarded = missions.filter((m) => m.rewarded).length;
  const total = missions.length;

  const handleClaim = (id: string) => {
    const reward = claimMission(id);
    if (reward > 0) {
      addPoints(reward);
      Alert.alert("🎉 보상 획득!", `${reward}P를 획득했어요!`);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>

        {/* 헤더 */}
        <View className="pt-6 pb-4">
          <Text className="text-slate-900 text-2xl font-bold">미션</Text>
          <Text className="text-slate-400 text-sm mt-0.5">{rewarded}/{total} 완료</Text>
        </View>

        {/* 전체 진행률 */}
        <View className="bg-white rounded-2xl p-4 mb-6" style={{ elevation: 2 }}>
          <View className="flex-row justify-between mb-2">
            <Text className="text-slate-600 text-sm font-medium">전체 달성률</Text>
            <Text className="text-emerald-500 text-sm font-bold">
              {Math.round((rewarded / total) * 100)}%
            </Text>
          </View>
          <View className="bg-slate-100 rounded-full h-2">
            <View
              className="bg-emerald-500 h-2 rounded-full"
              style={{ width: `${Math.round((rewarded / total) * 100)}%` }}
            />
          </View>
        </View>

        {/* 일일 미션 */}
        <Text className="text-slate-700 font-bold text-sm mb-3 uppercase tracking-wide">
          오늘의 미션
        </Text>
        {daily.map((m) => (
          <MissionCard
            key={m.id}
            mission={m}
            currentSteps={todaySteps}
            onClaim={handleClaim}
          />
        ))}

        {/* 주간 미션 */}
        <Text className="text-slate-700 font-bold text-sm mt-4 mb-3 uppercase tracking-wide">
          주간 미션
        </Text>
        {weekly.map((m) => (
          <MissionCard
            key={m.id}
            mission={m}
            currentSteps={weeklySteps}
            onClaim={handleClaim}
          />
        ))}

        <View className="h-6" />
      </ScrollView>
    </SafeAreaView>
  );
}
