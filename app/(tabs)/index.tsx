import { ProfileHeader } from "@/components/profile-header";
import { MonthlySpent } from "@/components/Subscriptions/MonthlySpent";
import { UpcomingSubscriptions } from "@/components/Subscriptions/Upcoming";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useAuth } from "@/contexts/AuthContext";
import { subscriptionsApi } from "@/lib/api";
import { homeStyles as styles } from "@/styles";
import { useQuery } from "@tanstack/react-query";
import { differenceInDays } from "date-fns";
import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  RefreshControl,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface Subscription {
  _id: string;
  name: string;
  price: number;
  currency: "USD" | "EUR" | "GBP";
  frequency: "daily" | "weekly" | "monthly" | "yearly";
  category: "food" | "entertainment" | "health" | "education" | "other";
  paymentMethod: string;
  status: "active" | "inactive" | "expired";
  startDate: string;
  renewalDate: string;
  icon?: string;
  createdAt: string;
  updatedAt: string;
}

export default function DashboardScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const {
    data: subscriptionsData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["subscriptions", user?._id],
    queryFn: () => subscriptionsApi.getUserSubscriptions(user!._id),
    enabled: !!user?._id,
  });

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setIsRefreshing(false);
  };

  const subscriptions: Subscription[] = subscriptionsData?.data || [];

  const totalSpending = useMemo(() => {
    const activeSubs = subscriptions.filter((sub) => sub.status === "active");
    return activeSubs.reduce((total, sub) => {
      let monthlyPrice = sub.price;
      if (sub.frequency === "daily") monthlyPrice = sub.price * 30;
      if (sub.frequency === "weekly") monthlyPrice = sub.price * 4;
      if (sub.frequency === "yearly") monthlyPrice = sub.price / 12;
      return total + monthlyPrice;
    }, 0);
  }, [subscriptions]);

  const upcomingRenewals = useMemo(() => {
    const now = new Date();
    return subscriptions.filter((sub) => {
      const renewal = new Date(sub.renewalDate);
      const daysUntil = differenceInDays(renewal, now);
      return daysUntil >= 0 && daysUntil <= 7 && sub.status === "active";
    });
  }, [subscriptions]);

  const getDaysUntilRenewal = (dateString: string) => {
    const days = differenceInDays(new Date(dateString), new Date());
    if (days < 0) return "Expired";
    if (days === 0) return "Today";
    return `${days} days`;
  };

  if (isLoading) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4649E5" />
      </ThemedView>
    );
  }

  if (error) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText style={styles.errorText}>
          Error loading subscriptions
        </ThemedText>
        <TouchableOpacity onPress={() => refetch()} style={styles.retryButton}>
          <ThemedText style={styles.buttonText}>Retry</ThemedText>
        </TouchableOpacity>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <FlatList
        data={subscriptions}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.subCard}
            onPress={() =>
              router.push({
                pathname: "/create-subscription",
                params: { id: item._id },
              })
            }
          >
            <View style={styles.subIconContainer}>
              {item.icon ? (
                <Image source={{ uri: item.icon }} style={styles.subLogo} />
              ) : (
                <View style={styles.subPlaceholderIcon}>
                  <ThemedText style={styles.subPlaceholderText}>
                    {item.name[0] || "?"}
                  </ThemedText>
                </View>
              )}
            </View>
            <View style={styles.subInfo}>
              <ThemedText style={styles.subName}>{item.name}</ThemedText>
              <ThemedText style={styles.subDue}>
                Due in {getDaysUntilRenewal(item.renewalDate)}
              </ThemedText>
            </View>
            <View style={styles.subPriceInfo}>
              <ThemedText style={styles.subPrice}>${item.price}</ThemedText>
              <ThemedText style={styles.subFrequency}>
                /{item.frequency === "monthly" ? "Month" : "Year"}
              </ThemedText>
            </View>
          </TouchableOpacity>
        )}
        ListHeaderComponent={
          <View style={{ paddingTop: insets.top + 20 }}>
            <ProfileHeader />
            <MonthlySpent amount={totalSpending} />
            {upcomingRenewals.length > 0 && (
              <UpcomingSubscriptions data={upcomingRenewals} />
            )}
            <ThemedText style={styles.sectionTitle}>
              My Subscriptions
            </ThemedText>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <ThemedText style={styles.emptyText}>
              No subscriptions yet
            </ThemedText>
            <TouchableOpacity
              onPress={() => router.push("/subscription-list")}
              style={styles.retryButton}
            >
              <ThemedText style={styles.buttonText}>
                Add Your First Subscription
              </ThemedText>
            </TouchableOpacity>
          </View>
        }
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor="#4649E5"
          />
        }
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </ThemedView>
  );
}
