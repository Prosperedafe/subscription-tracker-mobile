import { AddIcon, HomeIcon, SettingsIcon } from "@/assets/icons/icons";
import { HapticTab } from "@/components/haptic-tab";
import { Tabs } from "expo-router";
import React from "react";

const TAB_ACTIVE_COLOR = "#4649E5";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: TAB_ACTIVE_COLOR,
        tabBarInactiveTintColor: "#9BA1A6",
        tabBarShowLabel: false,
        headerShown: false,
        tabBarButton: HapticTab,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => <HomeIcon color={color} />,
        }}
      />
      <Tabs.Screen
        name="subscription-list"
        options={{
          title: "Subscription List",
          tabBarIcon: ({ color }) => <AddIcon color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color }) => <SettingsIcon color={color} />,
        }}
      />
    </Tabs>
  );
}
