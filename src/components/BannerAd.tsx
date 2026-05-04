import React from "react";
import { BannerAd, BannerAdSize } from "react-native-google-mobile-ads";

const adUnitId = "ca-app-pub-9386782255677460/8695539398";

export default function AppBannerAd() {
  return (
    <BannerAd
      unitId={adUnitId}
      size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
      requestOptions={{ requestNonPersonalizedAdsOnly: false }}
    />
  );
}
