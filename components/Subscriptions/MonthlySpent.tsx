import { FontFamily } from "@/constants/theme";
import React from "react";
import { StyleSheet, View } from "react-native";
import { ThemedText } from "../themed-text";

interface MonthlySpentProps {
  amount: number;
}

export const MonthlySpent = ({ amount }: MonthlySpentProps) => {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconCircle}>
          <ThemedText style={styles.icon}>$</ThemedText>
        </View>
        <ThemedText style={styles.value}>
          {amount.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </ThemedText>
        <ThemedText style={styles.subtitle}>Amount Spent this month</ThemedText>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    borderRadius: 20,
    backgroundColor: "#4649E5",
    overflow: "hidden",
    marginBottom: 30,
    borderWidth: 1,
    padding: 24,
  },
  gridContainer: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  content: {
    justifyContent: "center",
    alignItems: "center",
    zIndex: 2,
  },
  iconCircle: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    borderWidth: 1,
    borderColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  icon: {
    fontSize: 28,
    fontFamily: FontFamily.semiBold,
    color: "#fff",
    textAlign: "center",
    marginTop: -1,
  },
  value: {
    fontSize: 35,
    fontFamily: FontFamily.bold,
    color: "#fff",
    letterSpacing: -0.5,
    textAlign: "center",
    marginBottom: 15,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: FontFamily.medium,
    color: "#fff",
    textAlign: "center",
    opacity: 0.9,
  },
});
