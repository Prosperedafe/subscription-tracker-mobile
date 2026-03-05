import { FontFamily } from "@/constants/theme";
import { useAuth } from "@/contexts/AuthContext";
import { router } from "expo-router";
import React, { useMemo } from "react";
import { Image, StyleSheet, TouchableOpacity, View } from "react-native";
import { ThemedText } from "./themed-text";

export function ProfileHeader() {
  const { user } = useAuth();
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Morning";
    if (hour < 17) return "Afternoon";
    return "Evening";
  }, []);

  return (
    <View style={styles.header}>
      <TouchableOpacity
        onPress={() => router.push("/profile")}
        style={styles.avatarContainer}
      >
        <Image
          source={
            user?.avatar
              ? { uri: user.avatar }
              : require("@/assets/icons/profile-icon.png")
          }
          style={styles.profileIcon}
        />
      </TouchableOpacity>
      <View style={styles.greetingContainer}>
        <ThemedText style={styles.headerTitle}>
          {greeting}, {user?.name || "Zain"}
        </ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 30,
  },
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#1A1A2E",
    padding: 2,
  },
  profileIcon: {
    width: "100%",
    height: "100%",
    borderRadius: 22,
  },
  greetingContainer: {
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: FontFamily.bold,
    color: "#fff",
  },
});
