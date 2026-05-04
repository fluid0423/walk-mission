import React, { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useStepStore } from "../store/useStepStore";
import { useMissionStore } from "../store/useMissionStore";

export default function ProfileScreen() {
  const { totalPoints, dailyGoal, setDailyGoal, weeklyRecords, todaySteps } = useStepStore();
  const { missions } = useMissionStore();

  const [editingGoal, setEditingGoal] = useState(false);
  const [goalInput, setGoalInput] = useState(String(dailyGoal));

  const completedMissions = missions.filter((m) => m.rewarded).length;
  const weeklySteps = weeklyRecords.reduce((sum, r) => sum + r.steps, 0) + todaySteps;
  const totalDistance = (weeklySteps * 0.0007).toFixed(1);

  const handleSaveGoal = () => {
    const val = parseInt(goalInput, 10);
    if (isNaN(val) || val < 1000 || val > 50000) {
      Alert.alert("오류", "목표는 1,000 ~ 50,000보 사이로 설정해주세요.");
      return;
    }
    setDailyGoal(val);
    setEditingGoal(false);
  };

  return (
    <SafeAreaView className="flex-1 bg-surface">
      <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
        {/* 헤더 */}
        <View className="pt-4 pb-4">
          <Text className="text-gray-900 text-xl font-bold">내 정보</Text>
        </View>

        {/* 포인트 카드 */}
        <View className="bg-primary rounded-3xl p-6 mb-4 items-center">
          <Text className="text-white/80 text-sm mb-1">총 획득 포인트</Text>
          <Text className="text-white text-5xl font-bold">{totalPoints.toLocaleString()}</Text>
          <Text className="text-white/80 text-base mt-1">P</Text>
        </View>

        {/* 주간 통계 */}
        <View className="bg-white rounded-2xl p-4 shadow-sm mb-4">
          <Text className="text-gray-700 font-bold mb-4">이번 주 통계</Text>
          <View className="flex-row justify-around">
            <View className="items-center">
              <Text className="text-2xl font-bold text-secondary">{weeklySteps.toLocaleString()}</Text>
              <Text className="text-gray-400 text-xs mt-1">총 걸음</Text>
            </View>
            <View className="w-px bg-gray-100" />
            <View className="items-center">
              <Text className="text-2xl font-bold text-secondary">{totalDistance}</Text>
              <Text className="text-gray-400 text-xs mt-1">km</Text>
            </View>
            <View className="w-px bg-gray-100" />
            <View className="items-center">
              <Text className="text-2xl font-bold text-secondary">{completedMissions}</Text>
              <Text className="text-gray-400 text-xs mt-1">미션 완료</Text>
            </View>
          </View>
        </View>

        {/* 주간 걸음 그래프 (바 형태) */}
        {weeklyRecords.length > 0 && (
          <View className="bg-white rounded-2xl p-4 shadow-sm mb-4">
            <Text className="text-gray-700 font-bold mb-4">최근 7일 걸음</Text>
            <View className="flex-row items-end justify-between h-20 gap-1">
              {weeklyRecords.map((r, i) => {
                const maxSteps = Math.max(...weeklyRecords.map((d) => d.steps), 1);
                const barHeight = Math.max((r.steps / maxSteps) * 64, 4);
                const dayLabel = new Date(r.date).toLocaleDateString("ko-KR", { weekday: "short" });
                return (
                  <View key={i} className="flex-1 items-center gap-1">
                    <View
                      className="w-full bg-primary rounded-t-md"
                      style={{ height: barHeight }}
                    />
                    <Text className="text-gray-400 text-xs">{dayLabel}</Text>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {/* 설정 */}
        <View className="bg-white rounded-2xl p-4 shadow-sm mb-6">
          <Text className="text-gray-700 font-bold mb-4">설정</Text>

          <View className="flex-row justify-between items-center">
            <View>
              <Text className="text-gray-900 font-medium">일일 목표 걸음 수</Text>
              <Text className="text-gray-400 text-sm">현재: {dailyGoal.toLocaleString()}보</Text>
            </View>
            {!editingGoal ? (
              <TouchableOpacity
                className="bg-surface border border-gray-200 px-3 py-1.5 rounded-xl"
                onPress={() => setEditingGoal(true)}
              >
                <Text className="text-gray-700 text-sm">변경</Text>
              </TouchableOpacity>
            ) : (
              <View className="flex-row items-center gap-2">
                <TextInput
                  className="border border-gray-300 rounded-xl px-3 py-1.5 text-gray-900 w-24"
                  value={goalInput}
                  onChangeText={setGoalInput}
                  keyboardType="number-pad"
                  autoFocus
                />
                <TouchableOpacity className="bg-primary px-3 py-1.5 rounded-xl" onPress={handleSaveGoal}>
                  <Text className="text-white text-sm font-bold">저장</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
