import { AppButton } from '@/components/app-button';
import { FormInput } from '@/components/form-input';
import { ThemedText } from '@/components/themed-text';
import { FontFamily, ViewGradient } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { getApiBaseUrl } from '@/lib/api';
import { zodResolver } from '@hookform/resolvers/zod';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Keyboard, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { z } from 'zod';

const signUpSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters').max(20, 'Name must be at most 20 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters').max(50, 'Password must be at most 50 characters'),
});

type SignUpFormData = z.infer<typeof signUpSchema>;

export default function SignUpScreen() {
  const router = useRouter();
  const { signUp } = useAuth();
  const insets = useSafeAreaInsets();
  const [isLoading, setIsLoading] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
  });

  const onSubmit = async (data: SignUpFormData) => {
    if (__DEV__) {
      console.log(data);
    }
    setIsLoading(true);
    try {
      await signUp(data.name, data.email, data.password);
      router.replace('/(tabs)');
    } catch (error: any) {
      if (__DEV__) {
        console.log(error);
      }
      const isNetworkError = !error?.response && (error?.message === 'Network Error' || error?.code === 'ERR_NETWORK');
      const message = isNetworkError
        ? `Can't reach API at ${getApiBaseUrl()}. On a phone? Use your computer's IP in EXPO_PUBLIC_API_URL. Ensure backend listens on 0.0.0.0.`
        : (error?.message || 'Failed to sign up');
      Toast.show({ type: 'error', text1: isNetworkError ? 'Network Error' : 'Error', text2: message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <LinearGradient
      style={StyleSheet.absoluteFill}
      colors={ViewGradient.colors}
      locations={[0, 1]}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
    >
      <KeyboardAvoidingView
        style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView contentContainerStyle={styles.scrollContent}>
            <Image source={require('@/assets/icons/logo.png')} style={styles.logo} />
            <ThemedText type="title" style={styles.title}>Sign Up</ThemedText>
            <View style={styles.form}>
              <FormInput
                control={control}
                name="name"
                label="Name"
                placeholder="Enter your name"
                error={errors.name?.message}
              />
              <FormInput
                control={control}
                name="email"
                label="Email"
                placeholder="Enter your email"
                error={errors.email?.message}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              <FormInput
                control={control}
                name="password"
                label="Password"
                placeholder="Enter your password"
                error={errors.password?.message}
                secureTextEntry
              />

              <AppButton
                title="Sign Up"
                onPress={handleSubmit(onSubmit)}
                loading={isLoading}
                disabled={isLoading || !isValid}
              />

              <TouchableOpacity
                style={styles.linkButton}
                onPress={() => router.push('/sign-in')}
              >
                <ThemedText style={styles.linkText}>
                  Already have an account? Sign In
                </ThemedText>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  logo: {
    width: 100,
    height: 100,
    alignSelf: 'center',
    marginBottom: 80,
  },
  scrollContent: {
    width: '100%',
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingBottom: 100,
    paddingTop: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 32,
    textAlign: 'center',
    fontFamily: FontFamily.regular,
  },
  form: {
    width: '100%',
  },
  submitButton: {
    marginTop: 8,
  },
  linkButton: {
    marginTop: 16,
    alignItems: 'center',
  },
  linkText: {
    fontSize: 14,
    textDecorationLine: 'underline',
  },
});
