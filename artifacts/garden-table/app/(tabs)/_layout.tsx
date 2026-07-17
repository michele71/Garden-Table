import { Feather } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import React from "react";
import { Platform, StyleSheet, View } from "react-native";

import { useColors } from "@/hooks/useColors";
import { useMyFlat } from "@/contexts/MyFlatContext";

export default function TabLayout() {
  const colors = useColors();
  const isWeb = Platform.OS === "web";
  const { myBookingsCount } = useMyFlat();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.mutedForeground,
        tabBarStyle: {
          position: "absolute",
          backgroundColor: colors.background,
          borderTopWidth: isWeb ? 1 : 0,
          borderTopColor: colors.border,
          elevation: 0,
        },
        tabBarBackground: () => (
          <View
            style={[StyleSheet.absoluteFill, { backgroundColor: colors.background }]}
          />
        ),
        tabBarLabelStyle: {
          fontFamily: "Inter_500Medium",
          fontSize: 11,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "This Week",
          tabBarIcon: ({ color, size }) => (
            <Feather name="calendar" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="my-bookings"
        options={{
          title: "My Flat",
          tabBarBadge: myBookingsCount > 0 ? myBookingsCount : undefined,
          tabBarBadgeStyle: {
            backgroundColor: colors.accent,
            fontSize: 10,
            minWidth: 16,
            height: 16,
            lineHeight: 16,
          },
          tabBarIcon: ({ color, size }) => (
            <Feather name="home" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
