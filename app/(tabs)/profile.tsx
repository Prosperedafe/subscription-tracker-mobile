import { ThemedText } from "@/components/themed-text";
import { BackButton } from "@/components/ui/BackButton";
import { ViewContainer } from "@/components/ui/ViewContainer";
import { FontFamily } from "@/constants/theme";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";
import { useRouter } from "expo-router";
import React from "react";
import { Alert, Image, StyleSheet, TouchableOpacity, View } from "react-native";

export default function ProfileScreen() {
  const router = useRouter();
  const { user, signOut } = useAuth();

  const handleSignOut = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: () => {
          signOut();
          router.replace("/sign-in");
        },
      },
    ]);
  };

  if (!user) {
    return (
      <ViewContainer style={{ paddingHorizontal: 20 }}>
        <ThemedText style={styles.loadingText}>Loading...</ThemedText>
      </ViewContainer>
    );
  }

  return (
    <ViewContainer style={{ paddingHorizontal: 20 }}>
      <BackButton
        onPress={() => {
          if (router.canGoBack()) {
            router.back();
          } else {
            router.replace("/(tabs)");
          }
        }}
      />
      <View style={styles.profileImageContainer}>
        <Image
          source={require("@/assets/icons/profile-icon.png")}
          style={styles.profileImage}
        />
        <ThemedText style={styles.profileName}>{user.name}</ThemedText>
      </View>
      <View style={styles.card}>
        <View style={styles.infoRow}>
          <ThemedText style={styles.label}>Email</ThemedText>
          <ThemedText style={styles.value}>{user.email}</ThemedText>
        </View>

        <View style={styles.infoRow}>
          <ThemedText style={styles.label}>Member Since</ThemedText>
          <ThemedText style={styles.value}>
            {format(new Date(user.createdAt), "MMM dd, yyyy")}
          </ThemedText>
        </View>
      </View>

      <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
        <ThemedText style={styles.signOutButtonText}>Logout</ThemedText>
      </TouchableOpacity>
    </ViewContainer>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: 20,
  },
  loadingText: {
    color: "#fff",
    textAlign: "center",
    marginTop: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 24,
    color: "#fff",
  },
  card: {
    gap: 20,
    marginTop: 20,
    marginBottom: 100,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 18,
    backgroundColor: "#101019",
    borderRadius: 12,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "rgba(255,255,255,0.8)",
  },
  value: {
    fontSize: 16,
    color: "#fff",
  },
  signOutButton: {
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    backgroundColor: "#FD3464",
  },
  signOutButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  profileImageContainer: {
    alignItems: "center",
    marginVertical: 24,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 24,
  },
  profileName: {
    fontSize: 26,
    fontFamily: FontFamily.semiBold,
    color: "#fff",
  },
});
