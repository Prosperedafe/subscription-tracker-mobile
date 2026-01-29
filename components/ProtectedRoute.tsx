import React, { useEffect, useRef } from 'react';
import { useRouter, useSegments, usePathname } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useAuth } from '@/contexts/AuthContext';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const segments = useSegments();
  const pathname = usePathname();
  const hasNavigated = useRef(false);

  useEffect(() => {
    if (!isLoading) {
      SplashScreen.hideAsync();
    }
  }, [isLoading]);

  useEffect(() => {
    if (isLoading) return;
    if (hasNavigated.current) return;

    const inAuthGroup = pathname === '/sign-in' || pathname === '/sign-up';

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
    return null;
  }

  return <>{children}</>;
}
