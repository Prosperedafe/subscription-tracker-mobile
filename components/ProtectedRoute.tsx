import React, { useEffect, useRef } from 'react';
import { useRouter, useSegments, usePathname } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { ActivityIndicator, StyleSheet } from 'react-native';
import { ThemedView } from './themed-view';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const segments = useSegments();
  const pathname = usePathname();
  const hasNavigated = useRef(false);

  useEffect(() => {
    if (isLoading) return;
    if (hasNavigated.current) return;

    const inAuthGroup = pathname === '/sign-in' || pathname === '/sign-up';
    const inTabsGroup = segments[0] === '(tabs)';

    if (!user && !inAuthGroup) {
      hasNavigated.current = true;
      router.replace('/sign-in' as any);
    } else if (user && inAuthGroup) {
      hasNavigated.current = true;
      router.replace('/(tabs)' as any);
    }
  }, [user, isLoading, segments, pathname]);

  useEffect(() => {
    if (!isLoading) {
      hasNavigated.current = false;
    }
  }, [isLoading]);

  if (isLoading) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </ThemedView>
    );
  }

  return <>{children}</>;
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
