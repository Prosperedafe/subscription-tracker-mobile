import React, { useState } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format, parseISO, addMonths, isValid } from 'date-fns';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { subscriptionsApi } from '@/lib/api';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors, FontFamily } from '@/constants/theme';
import Toast from 'react-native-toast-message';
import { useAuth } from '@/contexts/AuthContext';

const API_DATE_FORMAT = 'yyyy-MM-dd';
const DISPLAY_DATE_FORMAT = 'MMM d, yyyy';

function toApiDate(date: Date): string {
  return format(date, API_DATE_FORMAT);
}

function parseApiDate(value: string | undefined): Date {
  if (!value) return new Date();
  try {
    const d = parseISO(value);
    return isValid(d) ? d : new Date();
  } catch {
    return new Date();
  }
}

const subscriptionSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name must be at most 100 characters'),
  price: z.number().min(0, 'Price must be greater than or equal to 0'),
  currency: z.enum(['USD', 'EUR', 'GBP']),
  frequency: z.enum(['daily', 'weekly', 'monthly', 'yearly']),
  category: z.enum(['food', 'entertainment', 'health', 'education', 'other']),
  paymentMethod: z.string().min(1, 'Payment method is required'),
  status: z.enum(['active', 'inactive', 'expired']).optional(),
  startDate: z.string().min(1, 'Start date is required'),
  renewalDate: z.string().min(1, 'Renewal date is required'),
}).refine((data) => {
  const start = new Date(data.startDate);
  const renewal = new Date(data.renewalDate);
  return renewal > start;
}, {
  message: 'Renewal date must be after start date',
  path: ['renewalDate'],
});

type SubscriptionFormData = z.infer<typeof subscriptionSchema>;

export default function CreateSubscriptionScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const colorScheme = useColorScheme();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);

  const today = new Date();
  const defaultRenewal = addMonths(today, 1);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<SubscriptionFormData>({
    resolver: zodResolver(subscriptionSchema),
    defaultValues: {
      currency: 'USD',
      frequency: 'monthly',
      category: 'other',
      status: 'active',
      startDate: toApiDate(today),
      renewalDate: toApiDate(defaultRenewal),
    },
  });

  const [datePickerOpen, setDatePickerOpen] = useState<'start' | 'renewal' | null>(null);

  const mutation = useMutation({
    mutationFn: subscriptionsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscriptions', user?._id] });
      Toast.show({ type: 'success', text1: 'Success', text2: 'Subscription created successfully' });
      setTimeout(() => router.back(), 1500);
    },
    onError: (error: any) => {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.response?.data?.message || 'Failed to create subscription',
      });
    },
  });

  const onSubmit = async (data: SubscriptionFormData) => {
    setIsLoading(true);
    try {
      await mutation.mutateAsync(data);
    } finally {
      setIsLoading(false);
    }
  };

  const colors = Colors[colorScheme ?? 'light'];

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <ThemedText type="title" style={styles.title}>Create Subscription</ThemedText>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <ThemedText style={styles.label}>Name *</ThemedText>
            <Controller
              control={control}
              name="name"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={[styles.input, { color: colors.text, borderColor: colors.icon, fontFamily: FontFamily.regular }]}
                  placeholder="Subscription name"
                  placeholderTextColor={colors.icon}
                  value={value}
                  onBlur={onBlur}
                  onChangeText={onChange}
                />
              )}
            />
            {errors.name && (
              <ThemedText style={styles.error}>{errors.name.message}</ThemedText>
            )}
          </View>

          <View style={styles.row}>
            <View style={[styles.inputContainer, styles.halfWidth]}>
              <ThemedText style={styles.label}>Price *</ThemedText>
              <Controller
                control={control}
                name="price"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={[styles.input, { color: colors.text, borderColor: colors.icon, fontFamily: FontFamily.regular }]}
                    placeholder="0.00"
                    placeholderTextColor={colors.icon}
                    value={value?.toString()}
                    onBlur={onBlur}
                    onChangeText={(text) => onChange(parseFloat(text) || 0)}
                    keyboardType="decimal-pad"
                  />
                )}
              />
              {errors.price && (
                <ThemedText style={styles.error}>{errors.price.message}</ThemedText>
              )}
            </View>

            <View style={[styles.inputContainer, styles.halfWidth]}>
              <ThemedText style={styles.label}>Currency *</ThemedText>
              <Controller
                control={control}
                name="currency"
                render={({ field: { onChange, value } }) => (
                  <View style={styles.pickerContainer}>
                    {(['USD', 'EUR', 'GBP'] as const).map((curr) => (
                      <TouchableOpacity
                        key={curr}
                        onPress={() => onChange(curr)}
                        style={[
                          styles.pickerOption,
                          value === curr && { backgroundColor: colors.tint },
                        ]}
                      >
                        <ThemedText style={[styles.pickerOptionText, value === curr && styles.pickerOptionTextActive]}>
                          {curr}
                        </ThemedText>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              />
            </View>
          </View>

          <View style={styles.inputContainer}>
            <ThemedText style={styles.label}>Frequency *</ThemedText>
            <Controller
              control={control}
              name="frequency"
              render={({ field: { onChange, value } }) => (
                <View style={styles.pickerContainer}>
                  {(['daily', 'weekly', 'monthly', 'yearly'] as const).map((freq) => (
                    <TouchableOpacity
                      key={freq}
                      onPress={() => onChange(freq)}
                      style={[
                        styles.pickerOption,
                        value === freq && { backgroundColor: colors.tint },
                      ]}
                    >
                      <ThemedText style={[styles.pickerOptionText, value === freq && styles.pickerOptionTextActive]}>
                        {freq.charAt(0).toUpperCase() + freq.slice(1)}
                      </ThemedText>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            />
          </View>

          <View style={styles.inputContainer}>
            <ThemedText style={styles.label}>Category *</ThemedText>
            <Controller
              control={control}
              name="category"
              render={({ field: { onChange, value } }) => (
                <View style={styles.pickerContainer}>
                  {(['food', 'entertainment', 'health', 'education', 'other'] as const).map((cat) => (
                    <TouchableOpacity
                      key={cat}
                      onPress={() => onChange(cat)}
                      style={[
                        styles.pickerOption,
                        value === cat && { backgroundColor: colors.tint },
                      ]}
                    >
                      <ThemedText style={[styles.pickerOptionText, value === cat && styles.pickerOptionTextActive]}>
                        {cat.charAt(0).toUpperCase() + cat.slice(1)}
                      </ThemedText>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            />
          </View>

          <View style={styles.inputContainer}>
            <ThemedText style={styles.label}>Payment Method *</ThemedText>
            <Controller
              control={control}
              name="paymentMethod"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={[styles.input, { color: colors.text, borderColor: colors.icon, fontFamily: FontFamily.regular }]}
                  placeholder="e.g., Credit Card, PayPal"
                  placeholderTextColor={colors.icon}
                  value={value}
                  onBlur={onBlur}
                  onChangeText={onChange}
                />
              )}
            />
            {errors.paymentMethod && (
              <ThemedText style={styles.error}>{errors.paymentMethod.message}</ThemedText>
            )}
          </View>

          <View style={styles.inputContainer}>
            <ThemedText style={styles.label}>Status</ThemedText>
            <Controller
              control={control}
              name="status"
              render={({ field: { onChange, value } }) => (
                <View style={styles.pickerContainer}>
                  {(['active', 'inactive', 'expired'] as const).map((stat) => (
                    <TouchableOpacity
                      key={stat}
                      onPress={() => onChange(stat)}
                      style={[
                        styles.pickerOption,
                        value === stat && { backgroundColor: colors.tint },
                      ]}
                    >
                      <ThemedText style={[styles.pickerOptionText, value === stat && styles.pickerOptionTextActive]}>
                        {stat.charAt(0).toUpperCase() + stat.slice(1)}
                      </ThemedText>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            />
          </View>

          <View style={styles.inputContainer}>
            <ThemedText style={styles.label}>Start Date *</ThemedText>
            <Controller
              control={control}
              name="startDate"
              render={({ field: { onChange, value } }) =>
                Platform.OS === 'web' ? (
                  <TextInput
                    style={[styles.input, { color: colors.text, borderColor: colors.icon, fontFamily: FontFamily.regular }]}
                    placeholder="YYYY-MM-DD"
                    placeholderTextColor={colors.icon}
                    value={value || ''}
                    onChangeText={onChange}
                    // @ts-expect-error - type="date" is valid for web
                    type="date"
                  />
                ) : (
                  <>
                    <TouchableOpacity
                      style={[styles.input, styles.dateTouchable, { borderColor: colors.icon, fontFamily: FontFamily.regular }]}
                      onPress={() => setDatePickerOpen('start')}
                    >
                      <ThemedText style={{ color: value ? colors.text : colors.icon }}>
                        {value ? format(parseApiDate(value), DISPLAY_DATE_FORMAT) : 'Tap to pick date'}
                      </ThemedText>
                    </TouchableOpacity>
                    {datePickerOpen === 'start' && (
                      <DateTimePicker
                        value={parseApiDate(value)}
                        mode="date"
                        display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                        onChange={(_, selectedDate) => {
                          setDatePickerOpen(null);
                          if (selectedDate) onChange(toApiDate(selectedDate));
                        }}
                      />
                    )}
                  </>
                )
              }
            />
            {errors.startDate && (
              <ThemedText style={styles.error}>{errors.startDate.message}</ThemedText>
            )}
          </View>

          <View style={styles.inputContainer}>
            <ThemedText style={styles.label}>Renewal Date *</ThemedText>
            <Controller
              control={control}
              name="renewalDate"
              render={({ field: { onChange, value } }) =>
                Platform.OS === 'web' ? (
                  <TextInput
                    style={[styles.input, { color: colors.text, borderColor: colors.icon, fontFamily: FontFamily.regular }]}
                    placeholder="YYYY-MM-DD"
                    placeholderTextColor={colors.icon}
                    value={value || ''}
                    onChangeText={onChange}
                    // @ts-expect-error - type="date" is valid for web
                    type="date"
                  />
                ) : (
                  <>
                    <TouchableOpacity
                      style={[styles.input, styles.dateTouchable, { borderColor: colors.icon, fontFamily: FontFamily.regular }]}
                      onPress={() => setDatePickerOpen('renewal')}
                    >
                      <ThemedText style={{ color: value ? colors.text : colors.icon }}>
                        {value ? format(parseApiDate(value), DISPLAY_DATE_FORMAT) : 'Tap to pick date'}
                      </ThemedText>
                    </TouchableOpacity>
                    {datePickerOpen === 'renewal' && (
                      <DateTimePicker
                        value={parseApiDate(value)}
                        mode="date"
                        display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                        onChange={(_, selectedDate) => {
                          setDatePickerOpen(null);
                          if (selectedDate) onChange(toApiDate(selectedDate));
                        }}
                      />
                    )}
                  </>
                )
              }
            />
            {errors.renewalDate && (
              <ThemedText style={styles.error}>{errors.renewalDate.message}</ThemedText>
            )}
          </View>

          <TouchableOpacity
            style={[styles.button, { backgroundColor: colors.tint }]}
            onPress={handleSubmit(onSubmit)}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <ThemedText style={styles.buttonText}>Create Subscription</ThemedText>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => router.back()}
          >
            <ThemedText style={styles.cancelButtonText}>Cancel</ThemedText>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 24,
  },
  form: {
    width: '100%',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfWidth: {
    flex: 1,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  dateTouchable: {
    justifyContent: 'center',
  },
  pickerContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  pickerOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  pickerOptionText: {
    fontSize: 14,
  },
  pickerOptionTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  error: {
    color: '#ff4444',
    fontSize: 12,
    marginTop: 4,
  },
  button: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    padding: 16,
    alignItems: 'center',
    marginTop: 12,
  },
  cancelButtonText: {
    fontSize: 16,
    textDecorationLine: 'underline',
  },
});
