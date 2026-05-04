import React from "react";
import { BannerAd, BannerAdSize, TestIds } from "react-native-google-mobile-ads";

// 실제 배포 시 TestIds.BANNER → 실제 광고 ID로 교체
const adUnitId = TestIds.BANNER;

export default function AppBannerAd() {
  return (
    <BannerAd
      unitId={adUnitId}
      size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
      requestOptions={{ requestNonPersonalizedAdsOnly: false }}
    />
  );
}
