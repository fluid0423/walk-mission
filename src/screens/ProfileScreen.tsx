import React, { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useStepStore } from "../store/useStepStore";
import { useMissionStore } from "../store/useMissionStore";

export default function ProfileScreen() {
  const { totalPoints, dailyGoal, setDailyGoal, dailyRecords, todaySteps, getWeeklySteps } = useStepStore();
  const { missions } = useMissionStore();

  const [editingGoal, setEditingGoal] = useState(false);
  const [goalInput, setGoalInput] = useState(String(dailyGoal));

  const completedMissions = missions.filter((m) => m.rewarded).length;
  const weeklySteps = getWeeklySteps();
  const allRecords = [...dailyRecords, { date: new Date().toISOString().split("T")[0], steps: todaySteps }];

  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dateStr = d.toISOString().split("T")[0];
    const record = allRecords.find((r) => r.date === dateStr);
    return {
      date: dateStr,
      steps: record?.steps ?? 0,
      label: d.toLocaleDateString("ko-KR", { weekday: "short" }),
      isToday: i === 6,
    };
  });

  const maxSteps = Math.max(...last7.map((d) => d.steps), 1);

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
    <SafeAreaView className="flex-1 bg-slate-50">
      <ScrollView showsVerticalScrollIndicator={false} className="px-6">

        {/* 헤더 */}
        <View className="pt-6 pb-4">
          <Text className="text-slate-900 text-2xl font-bold">내 정보</Text>
        </View>

        {/* 포인트 배너 */}
        <View
          className="bg-slate-900 rounded-3xl p-6 mb-4"
          style={{ elevation: 3 }}
        >
          <Text className="text-slate-400 text-sm font-medium mb-1">총 획득 포인트</Text>
          <View className="flex-row items-baseline gap-1">
            <Text className="text-white text-5xl font-bold">{totalPoints.toLocaleString()}</Text>
            <Text className="text-slate-400 text-xl">P</Text>
          </View>
          <View className="flex-row gap-4 mt-4">
            <View className="bg-white/10 rounded-2xl px-4 py-2.5 flex-1 items-center">
              <Text className="text-white font-bold text-lg">{completedMissions}</Text>
              <Text className="text-slate-400 text-xs">완료 미션</Text>
            </View>
            <View className="bg-white/10 rounded-2xl px-4 py-2.5 flex-1 items-center">
              <Text className="text-white font-bold text-lg">{allRecords.filter((r) => r.steps >= dailyGoal).length}</Text>
              <Text className="text-slate-400 text-xs">목표 달성일</Text>
            </View>
          </View>
        </View>

        {/* 주간 바 차트 */}
        <View className="bg-white rounded-3xl p-5 mb-4" style={{ elevation: 2 }}>
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-slate-900 font-bold">이번 주</Text>
            <Text className="text-emerald-500 font-semibold text-sm">{weeklySteps.toLocaleString()}보</Text>
          </View>
          <View className="flex-row items-end gap-1.5" style={{ height: 80 }}>
            {last7.map((day) => {
              const barH = Math.max((day.steps / maxSteps) * 64, day.steps > 0 ? 4 : 0);
              const isGoal = day.steps >= dailyGoal;
              return (
                <View key={day.date} className="flex-1 items-center gap-1">
                  <View
                    className={`w-full rounded-t-lg ${
                      day.isToday ? "bg-emerald-500" : isGoal ? "bg-emerald-300" : "bg-slate-200"
                    }`}
                    style={{ height: barH }}
                  />
                  <Text className={`text-xs ${day.isToday ? "text-emerald-500 font-bold" : "text-slate-400"}`}>
                    {day.label}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* 설정 */}
        <View className="bg-white rounded-3xl p-5 mb-6" style={{ elevation: 2 }}>
          <Text className="text-slate-900 font-bold mb-4">설정</Text>

          <View className="flex-row justify-between items-center">
            <View>
              <Text className="text-slate-900 font-medium">일일 목표 걸음 수</Text>
              <Text className="text-slate-400 text-sm">{dailyGoal.toLocaleString()}보</Text>
            </View>
            {!editingGoal ? (
              <TouchableOpacity
                className="border border-slate-200 px-4 py-2 rounded-xl"
                onPress={() => setEditingGoal(true)}
              >
                <Text className="text-slate-600 text-sm font-medium">변경</Text>
              </TouchableOpacity>
            ) : (
              <View className="flex-row items-center gap-2">
                <TextInput
                  className="border border-slate-300 rounded-xl px-3 py-2 text-slate-900 w-24 text-sm"
                  value={goalInput}
                  onChangeText={setGoalInput}
                  keyboardType="number-pad"
                  autoFocus
                />
                <TouchableOpacity
                  className="bg-emerald-500 px-4 py-2 rounded-xl"
                  onPress={handleSaveGoal}
                >
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
