import React, { useEffect, useRef } from "react";
import { View, Text, ScrollView, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Pedometer } from "expo-sensors";
import { InterstitialAd, AdEventType, TestIds } from "react-native-google-mobile-ads";
import CircleProgress from "../components/CircleProgress";
import AppBannerAd from "../components/BannerAd";
import { useStepStore } from "../store/useStepStore";
import { useMissionStore } from "../store/useMissionStore";

const interstitialAdUnitId = TestIds.INTERSTITIAL;

export default function HomeScreen() {
  const { todaySteps, dailyGoal, totalPoints, setTodaySteps, addPoints, checkAndResetForNewDay, weeklyRecords } = useStepStore();
  const { checkAndResetMissions, updateMissionProgress, claimMission } = useMissionStore();

  const interstitial = useRef(InterstitialAd.createForAdRequest(interstitialAdUnitId));
  const baseStepsRef = useRef(0);

  const weeklySteps = weeklyRecords.reduce((sum, r) => sum + r.steps, 0) + todaySteps;
  const progress = Math.min(todaySteps / dailyGoal, 1);
  const progressPercent = Math.round(progress * 100);

  useEffect(() => {
    checkAndResetForNewDay();
    checkAndResetMissions();

    interstitial.current.load();

    const unsubscribeLoaded = interstitial.current.addAdEventListener(AdEventType.LOADED, () => {});
    return () => unsubscribeLoaded();
  }, []);

  useEffect(() => {
    let subscription: ReturnType<typeof Pedometer.watchStepCount>;

    (async () => {
      const { status } = await Pedometer.requestPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("권한 필요", "걸음 수 측정을 위해 신체 활동 권한이 필요합니다.");
        return;
      }

      const available = await Pedometer.isAvailableAsync();
      if (!available) return;

      const start = new Date();
      start.setHours(0, 0, 0, 0);
      const result = await Pedometer.getStepCountAsync(start, new Date());
      baseStepsRef.current = result.steps;
      setTodaySteps(result.steps);

      subscription = Pedometer.watchStepCount((stepResult) => {
        const total = baseStepsRef.current + stepResult.steps;
        setTodaySteps(total);
      });
    })();

    return () => subscription?.remove();
  }, []);

  useEffect(() => {
    const completedIds = updateMissionProgress(todaySteps, weeklySteps);
    completedIds.forEach((id) => {
      const reward = claimMission(id);
      if (reward > 0) {
        addPoints(reward);
        if (interstitial.current) {
          try {
            interstitial.current.show();
            interstitial.current.load();
          } catch {}
        }
      }
    });
  }, [todaySteps]);

  const getMotivationMessage = () => {
    if (todaySteps === 0) return "오늘도 파이팅! 첫 발을 내딛어봐요 🚀";
    if (progress < 0.3) return "좋은 시작이에요! 계속 걸어봐요 💪";
    if (progress < 0.5) return "절반 왔어요! 조금만 더 걸어요 🔥";
    if (progress < 1.0) return "거의 다 왔어요! 마지막 스퍼트 🏃";
    return "목표 달성! 오늘 정말 잘하셨어요 🎉";
  };

  const dateStr = new Date().toLocaleDateString("ko-KR", { month: "long", day: "numeric", weekday: "short" });

  return (
    <SafeAreaView className="flex-1 bg-surface">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* 헤더 */}
        <View className="px-6 pt-4 pb-2 flex-row justify-between items-center">
          <View>
            <Text className="text-gray-400 text-sm">{dateStr}</Text>
            <Text className="text-gray-900 text-xl font-bold">오늘의 걸음</Text>
          </View>
          <View className="bg-accent/10 px-3 py-1.5 rounded-full flex-row items-center gap-1">
            <Text className="text-accent font-bold text-sm">🏅 {totalPoints.toLocaleString()}P</Text>
          </View>
        </View>

        {/* 원형 진행 */}
        <View className="items-center py-8">
          <CircleProgress size={220} progress={progress} strokeWidth={18}>
            <View className="items-center">
              <Text className="text-5xl font-bold text-gray-900">{todaySteps.toLocaleString()}</Text>
              <Text className="text-gray-400 text-sm mt-1">걸음</Text>
              <Text className="text-primary font-semibold text-base mt-1">{progressPercent}%</Text>
            </View>
          </CircleProgress>
        </View>

        {/* 동기 메시지 */}
        <View className="mx-6 bg-primary/10 rounded-2xl px-4 py-3 mb-6">
          <Text className="text-primary-dark font-medium text-center text-sm">{getMotivationMessage()}</Text>
        </View>

        {/* 통계 카드 */}
        <View className="mx-6 flex-row gap-3 mb-6">
          <View className="flex-1 bg-white rounded-2xl p-4 shadow-sm items-center">
            <Text className="text-2xl mb-1">🎯</Text>
            <Text className="text-gray-900 font-bold text-base">{dailyGoal.toLocaleString()}</Text>
            <Text className="text-gray-400 text-xs">오늘 목표</Text>
          </View>
          <View className="flex-1 bg-white rounded-2xl p-4 shadow-sm items-center">
            <Text className="text-2xl mb-1">🔥</Text>
            <Text className="text-gray-900 font-bold text-base">{Math.round(todaySteps * 0.04)}</Text>
            <Text className="text-gray-400 text-xs">칼로리(kcal)</Text>
          </View>
          <View className="flex-1 bg-white rounded-2xl p-4 shadow-sm items-center">
            <Text className="text-2xl mb-1">📍</Text>
            <Text className="text-gray-900 font-bold text-base">{(todaySteps * 0.0007).toFixed(1)}</Text>
            <Text className="text-gray-400 text-xs">거리(km)</Text>
          </View>
        </View>

        {/* 주간 요약 */}
        <View className="mx-6 bg-white rounded-2xl p-4 shadow-sm mb-6">
          <Text className="text-gray-900 font-semibold mb-3">이번 주 총 걸음</Text>
          <View className="flex-row items-baseline gap-2">
            <Text className="text-3xl font-bold text-secondary">{weeklySteps.toLocaleString()}</Text>
            <Text className="text-gray-400 text-sm">걸음</Text>
          </View>
        </View>

        <View className="h-4" />
      </ScrollView>

      {/* 배너 광고 */}
      <View className="items-center">
        <AppBannerAd />
      </View>
    </SafeAreaView>
  );
}
