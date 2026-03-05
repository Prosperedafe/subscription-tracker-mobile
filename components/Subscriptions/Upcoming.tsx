import { FontFamily } from "@/constants/theme";
import { differenceInDays } from "date-fns";
import { useRouter } from "expo-router";
import React from "react";
import {
  FlatList,
  Image,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { ThemedText } from "../themed-text";

interface UpcomingSubscriptionsProps {
  data: any[];
}

export const UpcomingSubscriptions = ({ data }: UpcomingSubscriptionsProps) => {
  const router = useRouter();

  const getDaysUntilRenewal = (dateString: string) => {
    const days = differenceInDays(new Date(dateString), new Date());
    if (days < 0) return "Expired";
    if (days === 0) return "Today";
    if (days === 1) return "Tomorrow";
    return days;
  };

  const renderItem = ({ item }: { item: any }) => {
    const daysLeft = getDaysUntilRenewal(item.renewalDate);

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() =>
          router.push({
            pathname: "/subscription-details",
            params: { id: item._id },
          })
        }
      >
        <View style={styles.cardHeader}>
          <View style={styles.iconBackground}>
            {item.icon ? (
              <Image source={{ uri: item.icon }} style={styles.logo} />
            ) : (
              <ThemedText style={styles.placeholderText}>
                {item.name[0]}
              </ThemedText>
            )}
          </View>
          <View style={styles.priceContainer}>
            <ThemedText style={styles.price}>${item.price}</ThemedText>
            <ThemedText style={styles.frequency}>
              /{item.frequency === "monthly" ? "Month" : "Year"}
            </ThemedText>
          </View>
        </View>

        <View style={styles.cardFooter}>
          <ThemedText style={styles.name}>{item.name}</ThemedText>
          <ThemedText style={styles.dueText}>
            Due in{" "}
            <ThemedText style={styles.dueHighlight}>{daysLeft}</ThemedText> days
          </ThemedText>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <ThemedText style={styles.sectionTitle}>Upcoming Payments</ThemedText>
      <FlatList
        data={data}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: FontFamily.bold,
    color: "#fff",
    marginBottom: 16,
    paddingHorizontal: 0,
  },
  listContent: {
    gap: 16,
  },
  card: {
    width: 180,
    backgroundColor: "#151524ff",
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: "#1A1A2E",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 20,
  },
  iconBackground: {
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  logo: {
    width: 40,
    height: 40,
    resizeMode: "contain",
  },
  placeholderText: {
    fontSize: 20,
    fontFamily: FontFamily.bold,
    color: "#fff",
  },
  priceContainer: {
    alignItems: "flex-end",
  },
  price: {
    fontSize: 18,
    fontFamily: FontFamily.bold,
    color: "#fff",
  },
  frequency: {
    fontSize: 12,
    fontFamily: FontFamily.regular,
    color: "#9BA1A6",
  },
  cardFooter: {
    gap: 4,
  },
  name: {
    fontSize: 18,
    fontFamily: FontFamily.bold,
    color: "#fff",
  },
  dueText: {
    fontSize: 14,
    fontFamily: FontFamily.medium,
    color: "#9BA1A6",
  },
  dueHighlight: {
    color: "#fff",
    fontFamily: FontFamily.bold,
  },
});
