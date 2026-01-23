import React, { useState, useMemo } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { format, differenceInDays, isPast } from 'date-fns';
import { useAuth } from '@/contexts/AuthContext';
import { subscriptionsApi } from '@/lib/api';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { IconSymbol } from '@/components/ui/icon-symbol';

interface Subscription {
  _id: string;
  name: string;
  price: number;
  currency: 'USD' | 'EUR' | 'GBP';
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  category: 'food' | 'entertainment' | 'health' | 'education' | 'other';
  paymentMethod: string;
  status: 'active' | 'inactive' | 'expired';
  startDate: string;
  renewalDate: string;
  createdAt: string;
  updatedAt: string;
}

type FilterType = 'all' | 'active' | 'inactive' | 'expired';
type SortType = 'renewal' | 'price-high' | 'price-low' | 'name';

export default function DashboardScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const colorScheme = useColorScheme();
  const [filter, setFilter] = useState<FilterType>('all');
  const [sort, setSort] = useState<SortType>('renewal');
  const [searchQuery, setSearchQuery] = useState('');

  const [isRefreshing, setIsRefreshing] = useState(false);

  const {
    data: subscriptionsData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['subscriptions', user?._id],
    queryFn: () => subscriptionsApi.getUserSubscriptions(user!._id),
    enabled: !!user?._id,
  });

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setIsRefreshing(false);
  };

  const subscriptions: Subscription[] = subscriptionsData?.data || [];

  const filteredAndSortedSubscriptions = useMemo(() => {
    let filtered = subscriptions;

    if (filter !== 'all') {
      filtered = filtered.filter((sub) => sub.status === filter);
    }

    if (searchQuery) {
      filtered = filtered.filter((sub) =>
        sub.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    const sorted = [...filtered].sort((a, b) => {
      switch (sort) {
        case 'renewal':
          return new Date(a.renewalDate).getTime() - new Date(b.renewalDate).getTime();
        case 'price-high':
          return b.price - a.price;
        case 'price-low':
          return a.price - b.price;
        case 'name':
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });

    return sorted;
  }, [subscriptions, filter, sort, searchQuery]);

  const totalSpending = useMemo(() => {
    const activeSubs = subscriptions.filter((sub) => sub.status === 'active');
    return activeSubs.reduce((total, sub) => {
      let monthlyPrice = sub.price;
      if (sub.frequency === 'daily') monthlyPrice = sub.price * 30;
      if (sub.frequency === 'weekly') monthlyPrice = sub.price * 4;
      if (sub.frequency === 'yearly') monthlyPrice = sub.price / 12;
      return total + monthlyPrice;
    }, 0);
  }, [subscriptions]);

  const upcomingRenewals = useMemo(() => {
    const now = new Date();
    const next7Days = subscriptions.filter((sub) => {
      const renewal = new Date(sub.renewalDate);
      const daysUntil = differenceInDays(renewal, now);
      return daysUntil >= 0 && daysUntil <= 7 && sub.status === 'active';
    });
    return next7Days;
  }, [subscriptions]);

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'MMM dd, yyyy');
  };

  const getDaysUntilRenewal = (dateString: string) => {
    const days = differenceInDays(new Date(dateString), new Date());
    if (days < 0) return 'Expired';
    if (days === 0) return 'Today';
    if (days === 1) return 'Tomorrow';
    return `${days} days`;
  };

  const colors = Colors[colorScheme ?? 'light'];

  if (isLoading) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </ThemedView>
    );
  }

  if (error) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText style={styles.errorText}>Error loading subscriptions</ThemedText>
        <TouchableOpacity onPress={() => refetch()} style={[styles.button, { backgroundColor: colors.tint }]}>
          <ThemedText style={styles.buttonText}>Retry</ThemedText>
        </TouchableOpacity>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <ThemedText type="title" style={styles.headerTitle}>Subscriptions</ThemedText>
        <TouchableOpacity
          onPress={() => router.push('/create-subscription')}
          style={[styles.addButton, { backgroundColor: colors.tint }]}
        >
          <IconSymbol name="plus" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={styles.statsContainer}>
        <View style={[styles.statCard, { backgroundColor: colors.background, borderColor: colors.icon }]}>
          <ThemedText style={styles.statLabel}>Monthly Spending</ThemedText>
          <ThemedText type="subtitle" style={styles.statValue}>
            {formatCurrency(totalSpending, 'USD')}
          </ThemedText>
        </View>
        <View style={[styles.statCard, { backgroundColor: colors.background, borderColor: colors.icon }]}>
          <ThemedText style={styles.statLabel}>Upcoming (7 days)</ThemedText>
          <ThemedText type="subtitle" style={styles.statValue}>
            {upcomingRenewals.length}
          </ThemedText>
        </View>
      </View>

      <TextInput
        style={[styles.searchInput, { color: colors.text, borderColor: colors.icon, backgroundColor: colors.background }]}
        placeholder="Search subscriptions..."
        placeholderTextColor={colors.icon}
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

      <View style={styles.filtersContainer}>
        <View style={styles.filterRow}>
          <ThemedText style={styles.filterLabel}>Filter:</ThemedText>
          {(['all', 'active', 'inactive', 'expired'] as FilterType[]).map((f) => (
            <TouchableOpacity
              key={f}
              onPress={() => setFilter(f)}
              style={[
                styles.filterButton,
                filter === f && { backgroundColor: colors.tint },
              ]}
            >
              <ThemedText style={[styles.filterButtonText, filter === f && styles.filterButtonTextActive]}>
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.filterRow}>
          <ThemedText style={styles.filterLabel}>Sort:</ThemedText>
          <TouchableOpacity
            onPress={() => setSort('renewal')}
            style={[styles.filterButton, sort === 'renewal' && { backgroundColor: colors.tint }]}
          >
            <ThemedText style={[styles.filterButtonText, sort === 'renewal' && styles.filterButtonTextActive]}>
              Renewal
            </ThemedText>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setSort('price-high')}
            style={[styles.filterButton, sort === 'price-high' && { backgroundColor: colors.tint }]}
          >
            <ThemedText style={[styles.filterButtonText, sort === 'price-high' && styles.filterButtonTextActive]}>
              Price ↓
            </ThemedText>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setSort('name')}
            style={[styles.filterButton, sort === 'name' && { backgroundColor: colors.tint }]}
          >
            <ThemedText style={[styles.filterButtonText, sort === 'name' && styles.filterButtonTextActive]}>
              Name
            </ThemedText>
          </TouchableOpacity>
        </View>
      </View>

      {filteredAndSortedSubscriptions.length === 0 ? (
        <ThemedView style={styles.emptyContainer}>
          <ThemedText style={styles.emptyText}>
            {searchQuery ? 'No subscriptions found' : 'No subscriptions yet'}
          </ThemedText>
          {!searchQuery && (
            <TouchableOpacity
              onPress={() => router.push('/create-subscription')}
              style={[styles.button, { backgroundColor: colors.tint }]}
            >
              <ThemedText style={styles.buttonText}>Create Your First Subscription</ThemedText>
            </TouchableOpacity>
          )}
        </ThemedView>
      ) : (
        <FlatList
          data={filteredAndSortedSubscriptions}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <View style={[styles.card, { backgroundColor: colors.background, borderColor: colors.icon }]}>
              <View style={styles.cardHeader}>
                <ThemedText type="subtitle" style={styles.cardTitle}>{item.name}</ThemedText>
                <View style={[styles.statusBadge, { backgroundColor: item.status === 'active' ? '#4CAF50' : item.status === 'expired' ? '#f44336' : '#9E9E9E' }]}>
                  <ThemedText style={styles.statusText}>{item.status}</ThemedText>
                </View>
              </View>
              <View style={styles.cardBody}>
                <ThemedText style={styles.cardText}>
                  {formatCurrency(item.price, item.currency)} / {item.frequency}
                </ThemedText>
                <ThemedText style={styles.cardText}>Category: {item.category}</ThemedText>
                <ThemedText style={styles.cardText}>Payment: {item.paymentMethod}</ThemedText>
                <View style={styles.renewalContainer}>
                  <ThemedText style={styles.cardText}>
                    Renews: {formatDate(item.renewalDate)}
                  </ThemedText>
                  <ThemedText style={[styles.renewalBadge, isPast(new Date(item.renewalDate)) && styles.renewalBadgeExpired]}>
                    {getDaysUntilRenewal(item.renewalDate)}
                  </ThemedText>
                </View>
              </View>
            </View>
          )}
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
          }
          contentContainerStyle={styles.listContent}
        />
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  statLabel: {
    fontSize: 12,
    opacity: 0.7,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  searchInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
  },
  filtersContainer: {
    marginBottom: 16,
    gap: 12,
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginRight: 4,
  },
  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  filterButtonText: {
    fontSize: 12,
  },
  filterButtonTextActive: {
    color: '#fff',
  },
  listContent: {
    paddingBottom: 16,
  },
  card: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  cardBody: {
    gap: 6,
  },
  cardText: {
    fontSize: 14,
  },
  renewalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  renewalBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#4CAF50',
  },
  renewalBadgeExpired: {
    backgroundColor: '#f44336',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    opacity: 0.7,
    marginBottom: 20,
  },
  button: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  errorText: {
    color: '#f44336',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 16,
  },
});
