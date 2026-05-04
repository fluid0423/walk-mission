import React, { useState } from "react";
import { View, Text } from "react-native";
import { BannerAd, BannerAdSize, TestIds } from "react-native-google-mobile-ads";

const adUnitId = __DEV__
  ? TestIds.BANNER
  : "ca-app-pub-9386782255677460/8695539398";

function DevMockBanner() {
  return (
    <View style={{
      width: "100%", height: 50,
      backgroundColor: "#E2E8F0",
      alignItems: "center", justifyContent: "center",
      borderTopWidth: 1, borderTopColor: "#CBD5E1",
    }}>
      <Text style={{ color: "#94A3B8", fontSize: 11 }}>광고 영역 (개발 모드)</Text>
    </View>
  );
}

export default function AppBannerAd() {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);

  if (__DEV__ && failed) return <DevMockBanner />;

  return (
    <View style={{ height: loaded ? undefined : 0, overflow: "hidden" }}>
      <BannerAd
        unitId={adUnitId}
        size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
        requestOptions={{ requestNonPersonalizedAdsOnly: false }}
        onAdLoaded={() => { setLoaded(true); setFailed(false); }}
        onAdFailedToLoad={() => { setLoaded(false); setFailed(true); }}
      />
    </View>
  );
}
