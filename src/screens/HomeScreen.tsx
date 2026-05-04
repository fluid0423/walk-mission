import React, { useEffect, useRef } from "react";
import { View, Text, ScrollView, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Pedometer } from "expo-sensors";
import { InterstitialAd, AdEventType, TestIds } from "react-native-google-mobile-ads";
import CircleProgress from "../components/CircleProgress";
import AppBannerAd from "../components/BannerAd";
import { useStepStore } from "../store/useStepStore";
import { useMissionStore } from "../store/useMissionStore";

export default function HomeScreen() {
  const {
    todaySteps, dailyGoal, totalPoints,
    setTodaySteps, addPoints, checkAndResetForNewDay,
    getWeeklySteps, saveTodayRecord,
  } = useStepStore();
  const { checkAndResetMissions, updateMissionProgress, claimMission } = useMissionStore();

  const interstitialId = __DEV__
    ? TestIds.INTERSTITIAL
    : "ca-app-pub-9386782255677460/4756294381";

  const interstitial = useRef(
    InterstitialAd.createForAdRequest(interstitialId)
  );
  const baseStepsRef = useRef(0);

  const progress = Math.min(todaySteps / dailyGoal, 1);
  const weeklySteps = getWeeklySteps();
  const calories = Math.round(todaySteps * 0.04);
  const distance = (todaySteps * 0.0007).toFixed(1);

  useEffect(() => {
    checkAndResetForNewDay();
    checkAndResetMissions();
    interstitial.current.load();
    const unsub = interstitial.current.addAdEventListener(AdEventType.LOADED, () => {});
    return () => unsub();
  }, []);

  useEffect(() => {
    let sub: ReturnType<typeof Pedometer.watchStepCount>;
    (async () => {
      const { status } = await Pedometer.requestPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("권한 필요", "걸음 수 측정을 위해 신체 활동 권한이 필요합니다.");
        return;
      }
      if (!(await Pedometer.isAvailableAsync())) return;

      const start = new Date();
      start.setHours(0, 0, 0, 0);
      const result = await Pedometer.getStepCountAsync(start, new Date());
      baseStepsRef.current = result.steps;
      setTodaySteps(result.steps);

      sub = Pedometer.watchStepCount((r) => {
        setTodaySteps(baseStepsRef.current + r.steps);
      });
    })();
    return () => sub?.remove();
  }, []);

  useEffect(() => {
    saveTodayRecord();
    const completedIds = updateMissionProgress(todaySteps, weeklySteps);
    completedIds.forEach((id) => {
      const reward = claimMission(id);
      if (reward > 0) {
        addPoints(reward);
        try { interstitial.current.show(); interstitial.current.load(); } catch {}
      }
    });
  }, [todaySteps]);

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "좋은 아침이에요 ☀️";
    if (h < 18) return "열심히 걷고 있나요? 💪";
    return "오늘 하루도 수고했어요 🌙";
  };

  const motivationText = () => {
    if (todaySteps === 0) return "첫 발을 내딛어봐요";
    if (progress < 0.5) return `${(dailyGoal - todaySteps).toLocaleString()}보 남았어요`;
    if (progress < 1) return "거의 다 왔어요!";
    return "오늘 목표 달성! 🎉";
  };

  const dateStr = new Date().toLocaleDateString("ko-KR", {
    month: "long", day: "numeric", weekday: "long",
  });

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* 헤더 */}
        <View className="px-6 pt-6 pb-2 flex-row justify-between items-start">
          <View>
            <Text className="text-slate-400 text-sm font-medium">{dateStr}</Text>
            <Text className="text-slate-900 text-2xl font-bold mt-0.5">{getGreeting()}</Text>
          </View>
          <View
            className="bg-amber-400 px-3 py-1.5 rounded-full"
            style={{ elevation: 2 }}
          >
            <Text className="text-white text-sm font-bold">🏅 {totalPoints.toLocaleString()}P</Text>
          </View>
        </View>

        {/* 메인 카드 */}
        <View
          className="mx-6 mt-4 bg-white rounded-3xl p-6"
          style={{ elevation: 3 }}
        >
          {/* 원형 진행 */}
          <View className="items-center py-2">
            <CircleProgress size={200} progress={progress} strokeWidth={16} color="#22C55E" bgColor="#F1F5F9">
              <View className="items-center">
                <Text className="text-[42px] font-bold text-slate-900 leading-tight">
                  {todaySteps.toLocaleString()}
                </Text>
                <Text className="text-slate-400 text-sm">걸음</Text>
                <Text className="text-emerald-500 font-semibold text-sm mt-1">
                  {Math.round(progress * 100)}% 달성
                </Text>
              </View>
            </CircleProgress>
          </View>

          {/* 동기 메시지 */}
          <View className="items-center mt-3 mb-5">
            <Text className="text-slate-500 text-sm">{motivationText()}</Text>
          </View>

          {/* 구분선 */}
          <View className="bg-slate-100 h-px mb-5" />

          {/* 통계 3개 */}
          <View className="flex-row justify-around">
            <View className="items-center">
              <Text className="text-2xl font-bold text-slate-900">{calories}</Text>
              <Text className="text-slate-400 text-xs mt-0.5">kcal</Text>
            </View>
            <View className="w-px bg-slate-100" />
            <View className="items-center">
              <Text className="text-2xl font-bold text-slate-900">{distance}</Text>
              <Text className="text-slate-400 text-xs mt-0.5">km</Text>
            </View>
            <View className="w-px bg-slate-100" />
            <View className="items-center">
              <Text className="text-2xl font-bold text-slate-900">{dailyGoal.toLocaleString()}</Text>
              <Text className="text-slate-400 text-xs mt-0.5">목표</Text>
            </View>
          </View>
        </View>

        {/* 주간 요약 카드 */}
        <View
          className="mx-6 mt-4 bg-emerald-500 rounded-3xl p-5"
          style={{ elevation: 3 }}
        >
          <Text className="text-emerald-100 text-sm font-medium mb-1">이번 주 총 걸음</Text>
          <View className="flex-row items-baseline gap-2">
            <Text className="text-white text-3xl font-bold">{weeklySteps.toLocaleString()}</Text>
            <Text className="text-emerald-200 text-sm">걸음</Text>
          </View>
          <Text className="text-emerald-100 text-xs mt-1">
            ≈ {(weeklySteps * 0.0007).toFixed(1)}km · {Math.round(weeklySteps * 0.04)}kcal
          </Text>
        </View>

        <View className="h-6" />
      </ScrollView>

      <View className="items-center bg-white border-t border-slate-100">
        <AppBannerAd />
      </View>
    </SafeAreaView>
  );
}
