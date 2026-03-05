import { ThemedText } from "@/components/themed-text";
import { BackButton } from "@/components/ui/BackButton";
import { ViewContainer } from "@/components/ui/ViewContainer";
import { FontFamily } from "@/constants/theme";
import { subscriptionsApi } from "@/lib/api";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { differenceInDays, format } from "date-fns";
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import {
    ActivityIndicator,
    Alert,
    Image,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View,
} from "react-native";
import Toast from "react-native-toast-message";

export default function SubscriptionDetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const queryClient = useQueryClient();
  const {
    data: subscriptionResponse,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["subscription", id],
    queryFn: () => subscriptionsApi.getById(id as string),
    enabled: !!id,
  });

  const cancelMutation = useMutation({
    mutationFn: () => subscriptionsApi.delete(id as string),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subscriptions"] });
      Toast.show({
        type: "success",
        text1: "Success",
        text2: "Subscription cancelled successfully",
      });
      router.replace("/(tabs)");
    },
    onError: () => {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to cancel subscription",
      });
    },
  });

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4649E5" />
      </View>
    );
  }

  if (error || !subscriptionResponse?.data) {
    return (
      <ViewContainer>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
        <View style={styles.centered}>
          <ThemedText style={styles.errorText}>
            Subscription not found
          </ThemedText>
        </View>
      </ViewContainer>
    );
  }

  const sub = subscriptionResponse.data;
  const daysUntil = differenceInDays(new Date(sub.renewalDate), new Date());

  const handleCancel = () => {
    Alert.alert(
      "Cancel Subscription",
      "Are you sure you want to cancel this subscription?",
      [
        { text: "No", style: "cancel" },
        {
          text: "Yes, Cancel",
          style: "destructive",
          onPress: () => cancelMutation.mutate(),
        },
      ],
    );
  };

  return (
    <ViewContainer style={{ paddingHorizontal: 20 }}>
      <ScrollView
        contentContainerStyle={[{ paddingBottom: 100 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <BackButton
            onPress={() => {
              if (router.canGoBack()) {
                router.back();
              } else {
                router.replace("/(tabs)");
              }
            }}
          />
        </View>

        <View style={styles.featuredContainer}>
          <View style={styles.logoAndNameContainer}>
            <View style={styles.logoContainer}>
              {sub.icon ? (
                <Image source={{ uri: sub.icon }} style={styles.logo} />
              ) : (
                <View style={styles.placeholderLogo}>
                  <ThemedText style={styles.placeholderText}>
                    {sub.name[0]}
                  </ThemedText>
                </View>
              )}
            </View>
            <ThemedText style={styles.subscriptionName}>{sub.name}</ThemedText>
          </View>

          <View style={styles.priceContainer}>
            <ThemedText style={styles.price}>${sub.price}</ThemedText>
            <ThemedText style={styles.planInfo}>
              {sub.frequency.charAt(0).toUpperCase() + sub.frequency.slice(1)} •{" "}
              {sub.plan || "Basic Plan"}
            </ThemedText>
            {daysUntil < 0 ? (
              <ThemedText
                style={{
                  color: "#fd3464",
                  fontFamily: FontFamily.bold,
                }}
              >
                Expired
              </ThemedText>
            ) : (
              <ThemedText style={styles.dueInfo}>
                Payment due in{" "}
                <ThemedText
                  style={{
                    color: "#4CAF50",
                    fontFamily: FontFamily.bold,
                  }}
                >
                  {daysUntil} days
                </ThemedText>
              </ThemedText>
            )}
          </View>
        </View>

        <View style={styles.detailsContainer}>
          {sub.status === "inactive" && (
            <View style={[styles.detailCard, styles.missedPaymentCard]}>
              <ThemedText style={[styles.detailLabel, { color: "#333" }]}>
                Missed Payment on
              </ThemedText>
              <ThemedText style={[styles.detailValue, { color: "#FD3464" }]}>
                {format(new Date(sub.renewalDate), "dd MMM yyyy")}
              </ThemedText>
            </View>
          )}

          <View style={styles.detailCard}>
            <ThemedText style={styles.detailLabel}>Started on</ThemedText>
            <ThemedText style={styles.detailValue}>
              {format(new Date(sub.startDate), "dd MMM yyyy")}
            </ThemedText>
          </View>

          <View style={styles.detailCard}>
            <ThemedText style={styles.detailLabel}>
              Total Amount Paid
            </ThemedText>
            <ThemedText style={styles.detailValue}>$346.12</ThemedText>
          </View>

          <View style={styles.detailCard}>
            <ThemedText style={styles.detailLabel}>Payment Method</ThemedText>
            <ThemedText style={styles.detailValue}>
              {sub.paymentMethod?.toUpperCase() || "UPI"}
            </ThemedText>
          </View>
        </View>

        <TouchableOpacity
          style={styles.cancelButton}
          onPress={handleCancel}
          disabled={cancelMutation.isPending}
        >
          {cancelMutation.isPending ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <ThemedText style={styles.cancelButtonText}>
              Cancel Subscription
            </ThemedText>
          )}
        </TouchableOpacity>
      </ScrollView>

      <Toast />
    </ViewContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#050511",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#050511",
  },
  header: {
    paddingBottom: 16,
    flexDirection: "row",
    alignItems: "center",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    fontSize: 18,
    color: "#FD3464",
    fontFamily: FontFamily.medium,
  },
  featuredContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginTop: 20,
    marginBottom: 40,
  },
  logoAndNameContainer: {
    flex: 1,
  },
  logoContainer: {
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  logo: {
    width: 44,
    height: 44,
  },
  placeholderLogo: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#4649E5",
    width: "100%",
  },
  placeholderText: {
    fontSize: 32,
    fontFamily: FontFamily.bold,
    color: "#fff",
  },
  subscriptionName: {
    fontSize: 20,
    fontFamily: FontFamily.bold,
    color: "#fff",
  },
  priceContainer: {
    alignItems: "flex-end",
  },
  price: {
    fontSize: 30,
    fontFamily: FontFamily.bold,
    color: "#fff",
    marginBottom: 4,
  },
  planInfo: {
    fontSize: 14,
    fontFamily: FontFamily.medium,
    color: "rgba(255,255,255,0.6)",
    marginBottom: 4,
  },
  dueInfo: {
    fontSize: 14,
    fontFamily: FontFamily.medium,
    color: "rgba(255,255,255,0.6)",
  },
  detailsContainer: {
    gap: 16,
  },
  detailCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#0B0B14",
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.04)",
  },
  missedPaymentCard: {
    backgroundColor: "#E4E4ED",
  },
  detailLabel: {
    fontSize: 16,
    fontFamily: FontFamily.medium,
    color: "rgba(255,255,255,0.6)",
  },
  detailValue: {
    fontSize: 16,
    fontFamily: FontFamily.bold,
    color: "#fff",
  },
  dropdownTrigger: {
    flexDirection: "row",
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#FD3464",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    marginTop: 50,
  },
  cancelButtonText: {
    color: "#fff",
    fontSize: 18,
    fontFamily: FontFamily.bold,
  },
});
