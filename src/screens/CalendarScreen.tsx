import React, { useState } from "react";
import { View, Text, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Calendar, DateData } from "react-native-calendars";
import { useStepStore } from "../store/useStepStore";

function stepColor(steps: number, goal: number): string {
  if (steps === 0) return "";
  const ratio = steps / goal;
  if (ratio >= 1.0) return "#16A34A";  // 목표 달성: 진한 녹색
  if (ratio >= 0.5) return "#22C55E";  // 50% 이상: 녹색
  if (ratio >= 0.3) return "#86EFAC";  // 30% 이상: 연녹색
  return "#BBF7D0";                     // 조금: 아주 연녹색
}

export default function CalendarScreen() {
  const { dailyRecords, dailyGoal, todaySteps } = useStepStore();
  const todayStr = new Date().toISOString().split("T")[0];

  const [selected, setSelected] = useState<string>(todayStr);

  // 달력 마킹 데이터 생성
  const allRecords = [
    ...dailyRecords,
    { date: todayStr, steps: todaySteps },
  ];

  const markedDates: Record<string, any> = {};
  allRecords.forEach(({ date, steps }) => {
    if (steps === 0) return;
    const color = stepColor(steps, dailyGoal);
    markedDates[date] = {
      marked: true,
      dotColor: color,
      selected: date === selected,
      selectedColor: date === selected ? "#22C55E" : undefined,
    };
  });

  // 선택된 날짜의 기록
  const selectedRecord = allRecords.find((r) => r.date === selected);
  const selectedSteps = selectedRecord?.steps ?? 0;
  const selectedProgress = Math.min(selectedSteps / dailyGoal, 1);
  const selectedDate = new Date(selected + "T00:00:00");
  const selectedLabel = selectedDate.toLocaleDateString("ko-KR", {
    year: "numeric", month: "long", day: "numeric", weekday: "short",
  });

  // 이번 달 통계
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

        {/* 이번달 요약 */}
        <View className="mx-6 mt-4 bg-white rounded-3xl p-5" style={{ elevation: 2 }}>
          <Text className="text-slate-500 text-sm font-medium mb-3">이번 달 요약</Text>
          <View className="flex-row justify-around">
            <View className="items-center">
              <Text className="text-2xl font-bold text-slate-900">{(monthTotal / 1000).toFixed(1)}k</Text>
              <Text className="text-slate-400 text-xs mt-0.5">총 걸음</Text>
            </View>
            <View className="w-px bg-slate-100" />
            <View className="items-center">
              <Text className="text-2xl font-bold text-emerald-500">{monthGoalDays}</Text>
              <Text className="text-slate-400 text-xs mt-0.5">목표 달성일</Text>
            </View>
            <View className="w-px bg-slate-100" />
            <View className="items-center">
              <Text className="text-2xl font-bold text-slate-900">{monthRecords.length}</Text>
              <Text className="text-slate-400 text-xs mt-0.5">활동일</Text>
            </View>
          </View>
        </View>

        {/* 달력 */}
        <View className="mx-6 mt-4 bg-white rounded-3xl overflow-hidden" style={{ elevation: 2 }}>
          <Calendar
            onDayPress={(day: DateData) => setSelected(day.dateString)}
            markedDates={{
              ...markedDates,
              [selected]: {
                ...markedDates[selected],
                selected: true,
                selectedColor: "#22C55E",
              },
            }}
            theme={{
              backgroundColor: "#FFFFFF",
              calendarBackground: "#FFFFFF",
              textSectionTitleColor: "#94A3B8",
              selectedDayBackgroundColor: "#22C55E",
              selectedDayTextColor: "#FFFFFF",
              todayTextColor: "#22C55E",
              dayTextColor: "#1E293B",
              textDisabledColor: "#CBD5E1",
              dotColor: "#22C55E",
              selectedDotColor: "#FFFFFF",
              arrowColor: "#22C55E",
              monthTextColor: "#1E293B",
              textDayFontWeight: "500",
              textMonthFontWeight: "700",
              textDayHeaderFontWeight: "600",
              textDayFontSize: 14,
              textMonthFontSize: 16,
            }}
          />
        </View>

        {/* 컬러 범례 */}
        <View className="mx-6 mt-3 flex-row items-center gap-4 px-1">
          {[
            { color: "#BBF7D0", label: "조금" },
            { color: "#86EFAC", label: "30%+" },
            { color: "#22C55E", label: "50%+" },
            { color: "#16A34A", label: "목표 달성" },
          ].map((item) => (
            <View key={item.label} className="flex-row items-center gap-1">
              <View className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
              <Text className="text-slate-400 text-xs">{item.label}</Text>
            </View>
          ))}
        </View>

        {/* 선택된 날짜 상세 */}
        <View className="mx-6 mt-4 bg-white rounded-3xl p-5" style={{ elevation: 2 }}>
          <Text className="text-slate-500 text-sm font-medium mb-1">{selectedLabel}</Text>

          {selectedSteps > 0 ? (
            <>
              <Text className="text-3xl font-bold text-slate-900 mt-1">
                {selectedSteps.toLocaleString()}
                <Text className="text-lg text-slate-400 font-normal"> 걸음</Text>
              </Text>

              <View className="bg-slate-100 rounded-full h-2 mt-3 mb-2">
                <View
                  className="bg-emerald-500 h-2 rounded-full"
                  style={{ width: `${Math.round(selectedProgress * 100)}%` }}
                />
              </View>

              <View className="flex-row justify-between">
                <Text className="text-slate-400 text-xs">0</Text>
                <Text className={`text-xs font-semibold ${selectedProgress >= 1 ? "text-emerald-500" : "text-slate-400"}`}>
                  {selectedProgress >= 1 ? "🎉 목표 달성!" : `${Math.round(selectedProgress * 100)}% / 목표 ${dailyGoal.toLocaleString()}보`}
                </Text>
                <Text className="text-slate-400 text-xs">{dailyGoal.toLocaleString()}</Text>
              </View>

              <View className="flex-row gap-4 mt-4">
                <View className="flex-1 bg-slate-50 rounded-2xl p-3 items-center">
                  <Text className="text-slate-900 font-bold">{Math.round(selectedSteps * 0.04)}</Text>
                  <Text className="text-slate-400 text-xs">kcal</Text>
                </View>
                <View className="flex-1 bg-slate-50 rounded-2xl p-3 items-center">
                  <Text className="text-slate-900 font-bold">{(selectedSteps * 0.0007).toFixed(1)}</Text>
                  <Text className="text-slate-400 text-xs">km</Text>
                </View>
              </View>
            </>
          ) : (
            <Text className="text-slate-400 mt-2">이 날의 기록이 없어요</Text>
          )}
        </View>

        <View className="h-6" />
      </ScrollView>
    </SafeAreaView>
  );
}
