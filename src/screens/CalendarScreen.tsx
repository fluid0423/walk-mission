import React, { useState } from "react";
import { View, Text, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import StepCalendar from "../components/StepCalendar";
import { useStepStore } from "../store/useStepStore";

export default function CalendarScreen() {
  const { dailyRecords = [], dailyGoal, todaySteps } = useStepStore();
  const todayStr = new Date().toISOString().split("T")[0];

  const [selected, setSelected] = useState(todayStr);

  const allRecords = [
    ...dailyRecords.filter((r) => r.date !== todayStr),
    { date: todayStr, steps: todaySteps },
  ];

  const selectedRecord = allRecords.find((r) => r.date === selected);
  const selectedSteps = selectedRecord?.steps ?? 0;
  const selectedProgress = Math.min(selectedSteps / dailyGoal, 1);
  const selectedDate = new Date(selected + "T00:00:00");
  const selectedLabel = selectedDate.toLocaleDateString("ko-KR", {
    year: "numeric", month: "long", day: "numeric", weekday: "short",
  });

  const currentMonth = todayStr.slice(0, 7);
  const monthRecords = allRecords.filter((r) => r.date.startsWith(currentMonth));
  const monthTotal = monthRecords.reduce((s, r) => s + r.steps, 0);
  const monthGoalDays = monthRecords.filter((r) => r.steps >= dailyGoal).length;

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* 헤더 */}
        <View className="px-6 pt-6 pb-2">
          <Text className="text-slate-900 text-2xl font-bold">기록</Text>
          <Text className="text-slate-400 text-sm mt-0.5">걸음 수 히스토리</Text>
        </View>

        {/* 이번 달 요약 */}
        <View className="mx-6 mt-4 bg-white rounded-3xl p-5" style={{ elevation: 2 }}>
          <Text className="text-slate-500 text-sm font-medium mb-3">이번 달 요약</Text>
          <View className="flex-row justify-around">
            <View className="items-center">
              <Text className="text-2xl font-bold text-slate-900">
                {monthTotal >= 1000 ? `${(monthTotal / 1000).toFixed(1)}k` : monthTotal}
              </Text>
              <Text className="text-slate-400 text-xs mt-0.5">총 걸음</Text>
            </View>
            <View className="w-px bg-slate-100" />
            <View className="items-center">
              <Text className="text-2xl font-bold text-emerald-500">{monthGoalDays}</Text>
              <Text className="text-slate-400 text-xs mt-0.5">목표 달성일</Text>
            </View>
            <View className="w-px bg-slate-100" />
            <View className="items-center">
              <Text className="text-2xl font-bold text-slate-900">{monthRecords.filter(r => r.steps > 0).length}</Text>
              <Text className="text-slate-400 text-xs mt-0.5">활동일</Text>
            </View>
          </View>
        </View>

        {/* 커스텀 달력 */}
        <View className="mx-6 mt-4">
          <StepCalendar
            records={allRecords}
            dailyGoal={dailyGoal}
            onSelectDate={setSelected}
            selectedDate={selected}
          />
        </View>

        {/* 컬러 범례 */}
        <View className="mx-6 mt-3 flex-row items-center gap-4 px-1">
          {[
            { color: "#BBF7D0", label: "조금" },
            { color: "#86EFAC", label: "30%+" },
            { color: "#22C55E", label: "50%+" },
            { color: "#16A34A", label: "목표달성" },
          ].map((item) => (
            <View key={item.label} className="flex-row items-center gap-1">
              <View className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
              <Text className="text-slate-400 text-xs">{item.label}</Text>
            </View>
          ))}
        </View>

        {/* 선택 날짜 상세 */}
        <View className="mx-6 mt-4 bg-white rounded-3xl p-5" style={{ elevation: 2 }}>
          <Text className="text-slate-500 text-sm font-medium mb-2">{selectedLabel}</Text>

          {selectedSteps > 0 ? (
            <>
              <Text className="text-3xl font-bold text-slate-900">
                {selectedSteps.toLocaleString()}
                <Text className="text-lg text-slate-400 font-normal"> 걸음</Text>
              </Text>

              <View className="bg-slate-100 rounded-full h-2 mt-3 mb-2">
                <View
                  className="bg-emerald-500 h-2 rounded-full"
                  style={{ width: `${Math.round(selectedProgress * 100)}%` }}
                />
              </View>

              <View className="flex-row justify-between mb-4">
                <Text className="text-slate-400 text-xs">0</Text>
                <Text className={`text-xs font-semibold ${selectedProgress >= 1 ? "text-emerald-500" : "text-slate-400"}`}>
                  {selectedProgress >= 1 ? "🎉 목표 달성!" : `${Math.round(selectedProgress * 100)}%`}
                </Text>
                <Text className="text-slate-400 text-xs">{dailyGoal.toLocaleString()}</Text>
              </View>

              <View className="flex-row gap-3">
                <View className="flex-1 bg-slate-50 rounded-2xl p-3 items-center">
                  <Text className="text-slate-900 font-bold text-lg">{Math.round(selectedSteps * 0.04)}</Text>
                  <Text className="text-slate-400 text-xs">kcal</Text>
                </View>
                <View className="flex-1 bg-slate-50 rounded-2xl p-3 items-center">
                  <Text className="text-slate-900 font-bold text-lg">{(selectedSteps * 0.0007).toFixed(1)}</Text>
                  <Text className="text-slate-400 text-xs">km</Text>
                </View>
              </View>
            </>
          ) : (
            <Text className="text-slate-400">이 날의 기록이 없어요</Text>
          )}
        </View>

        <View className="h-6" />
      </ScrollView>
    </SafeAreaView>
  );
}
