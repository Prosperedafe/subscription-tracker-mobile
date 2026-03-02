import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Colors, FontFamily } from "@/constants/theme";
import { subscriptionsApi } from "@/lib/api";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    Image,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const SubscriptionList = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState("");

  const { data: subscriptions, isLoading } = useQuery({
    queryKey: ["subscriptions-list"],
    queryFn: () => subscriptionsApi.getSubscriptionList(),
  });

  const filteredSubscriptions = subscriptions?.filter((sub: any) =>
    sub.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.subscriptionItem}>
      <View style={styles.iconContainer}>
        {item.icon ? (
          <Image source={{ uri: item.icon }} style={styles.logo} />
        ) : (
          <View style={[styles.logo, styles.placeholderLogo]}>
            <ThemedText style={styles.logoText}>{item.name[0]}</ThemedText>
          </View>
        )}
      </View>
      <ThemedText style={styles.subscriptionName}>{item.name}</ThemedText>
      <TouchableOpacity style={styles.addButton}>
        <IconSymbol name="plus" size={20} color="#fff" />
      </TouchableOpacity>
    </View>
  );

  return (
    <ThemedView style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <ThemedText style={styles.title}>All Subscriptions</ThemedText>
      </View>

      <View style={styles.searchContainer}>
        <Ionicons
          name="search"
          size={20}
          color="#9BA1A6"
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.searchInput}
          placeholder="Search"
          placeholderTextColor="#9BA1A6"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {isLoading ? (
        <ActivityIndicator
          size="large"
          color={Colors.dark.tint}
          style={{ marginTop: 20 }}
        />
      ) : (
        <FlatList
          data={filteredSubscriptions}
          renderItem={renderItem}
          keyExtractor={(item) => item._id || item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    backgroundColor: "#050511",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    marginBottom: 20,
  },
  backButton: {
    marginRight: 15,
  },
  title: {
    fontSize: 24,
    fontFamily: FontFamily.bold,
    color: "#fff",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#101019",
    borderRadius: 12,
    paddingHorizontal: 15,
    height: 48,
    marginBottom: 20,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    color: "#fff",
    fontSize: 16,
    fontFamily: FontFamily.regular,
  },
  customSubscription: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#101019",
    borderWidth: 1,
    borderColor: "#1A1A2E",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  customText: {
    fontSize: 16,
    fontFamily: FontFamily.medium,
    color: "#fff",
  },
  listContent: {
    paddingBottom: 20,
  },
  subscriptionItem: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#1A1A2E",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  iconContainer: {
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  logo: {
    width: 44,
    height: 44,
    resizeMode: "contain",
  },
  placeholderLogo: {
    justifyContent: "center",
    alignItems: "center",
  },
  logoText: {
    color: "#fff",
    fontSize: 18,
    fontFamily: FontFamily.bold,
  },
  subscriptionName: {
    flex: 1,
    fontSize: 16,
    fontFamily: FontFamily.medium,
    color: "#fff",
  },
  addButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#101019",
    borderWidth: 1,
    borderColor: "#1A1A2E",
    justifyContent: "center",
    alignItems: "center",
  },
});

export default SubscriptionList;
