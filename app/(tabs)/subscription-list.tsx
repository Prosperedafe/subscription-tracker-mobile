import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Colors } from "@/constants/theme";
import { subscriptionsApi } from "@/lib/api";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    Image,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useSubscription } from "@/contexts/SubscriptionContext";
import { subscriptionListStyles } from "@/styles/subscription";

const SubscriptionList = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState("");
  const { setSelectedSubscription } = useSubscription();

  const { data: subscriptions, isLoading } = useQuery({
    queryKey: ["subscriptions-list"],
    queryFn: () => subscriptionsApi.getSubscriptionList(),
  });

  const handleAddSubscription = (item: any) => {
    setSelectedSubscription({
      name: item.name,
      icon: item.icon,
      price: item.price,
      category: item.category,
      plans: item.plans,
    });
    router.push("/(tabs)/create-subscription");
  };

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
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => handleAddSubscription(item)}
      >
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

const styles = subscriptionListStyles;

export default SubscriptionList;
