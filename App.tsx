import "./global.css";
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Text } from "react-native";
import mobileAds from "react-native-google-mobile-ads";

import HomeScreen from "./src/screens/HomeScreen";
import MissionScreen from "./src/screens/MissionScreen";
import ProfileScreen from "./src/screens/ProfileScreen";

mobileAds().initialize();

const Tab = createBottomTabNavigator();

function TabIcon({ emoji, focused }: { emoji: string; focused: boolean }) {
  return (
    <Text style={{ fontSize: focused ? 26 : 22, opacity: focused ? 1 : 0.5 }}>
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
              borderTopColor: "#F3F4F6",
              height: 64,
              paddingBottom: 10,
            },
            tabBarActiveTintColor: "#22C55E",
            tabBarInactiveTintColor: "#9CA3AF",
            tabBarLabelStyle: { fontSize: 11, fontWeight: "600" },
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
