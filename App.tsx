import "./global.css";
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Text } from "react-native";
import mobileAds from "react-native-google-mobile-ads";

import HomeScreen from "./src/screens/HomeScreen";
import MissionScreen from "./src/screens/MissionScreen";
import CalendarScreen from "./src/screens/CalendarScreen";
import ProfileScreen from "./src/screens/ProfileScreen";

mobileAds()
  .setRequestConfiguration({ testDeviceIdentifiers: ["EMULATOR"] })
  .then(() => mobileAds().initialize());

const Tab = createBottomTabNavigator();

function TabIcon({ emoji, focused }: { emoji: string; focused: boolean }) {
  return (
    <Text style={{ fontSize: focused ? 24 : 20, opacity: focused ? 1 : 0.4 }}>
      {emoji}
    </Text>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={{
            headerShown: false,
            tabBarStyle: {
              backgroundColor: "#FFFFFF",
              borderTopColor: "#F1F5F9",
              borderTopWidth: 1,
              height: 68,
              paddingBottom: 12,
              paddingTop: 8,
            },
            tabBarActiveTintColor: "#22C55E",
            tabBarInactiveTintColor: "#94A3B8",
            tabBarLabelStyle: { fontSize: 10, fontWeight: "600" },
          }}
        >
          <Tab.Screen
            name="Home"
            component={HomeScreen}
            options={{
              tabBarLabel: "홈",
              tabBarIcon: ({ focused }) => <TabIcon emoji="🚶" focused={focused} />,
            }}
          />
          <Tab.Screen
            name="Mission"
            component={MissionScreen}
            options={{
              tabBarLabel: "미션",
              tabBarIcon: ({ focused }) => <TabIcon emoji="🏆" focused={focused} />,
            }}
          />
          <Tab.Screen
            name="Calendar"
            component={CalendarScreen}
            options={{
              tabBarLabel: "기록",
              tabBarIcon: ({ focused }) => <TabIcon emoji="📅" focused={focused} />,
            }}
          />
          <Tab.Screen
            name="Profile"
            component={ProfileScreen}
            options={{
              tabBarLabel: "내정보",
              tabBarIcon: ({ focused }) => <TabIcon emoji="👤" focused={focused} />,
            }}
          />
        </Tab.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
