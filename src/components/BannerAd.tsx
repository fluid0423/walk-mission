import React, { useState } from "react";
import { View } from "react-native";
import { BannerAd, BannerAdSize, TestIds, BannerAdProps } from "react-native-google-mobile-ads";

const adUnitId = __DEV__
  ? TestIds.BANNER
  : "ca-app-pub-9386782255677460/8695539398";

export default function AppBannerAd() {
  const [loaded, setLoaded] = useState(false);

  return (
    <View style={{ height: loaded ? undefined : 0, overflow: "hidden" }}>
      <BannerAd
        unitId={adUnitId}
        size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
        requestOptions={{ requestNonPersonalizedAdsOnly: false }}
        onAdLoaded={() => setLoaded(true)}
        onAdFailedToLoad={() => setLoaded(false)}
      />
    </View>
  );
}
