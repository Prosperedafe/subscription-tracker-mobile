import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { FontFamily } from "@/constants/theme";
import { useAuth } from "@/contexts/AuthContext";
import { subscriptionsApi } from "@/lib/api";
import { zodResolver } from "@hookform/resolvers/zod";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addDays, format, isValid, parseISO } from "date-fns";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import {
  ActivityIndicator,
  AppState,
  Image,
  Modal,
  Platform,
  ScrollView,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { z } from "zod";

import { BackButton } from "@/components/ui/BackButton";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { createSubscriptionStyles } from "@/styles/subscription";
import Ionicons from "@expo/vector-icons/Ionicons";

const API_DATE_FORMAT = "yyyy-MM-dd";

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
  name: z.string().min(2, "Name is required"),
  plan: z.string().optional(),
  price: z.number().min(0, "Price must be at least 0"),
  currency: z.enum(["USD", "EUR", "GBP"]),
  frequency: z.enum(["monthly", "quarterly", "yearly"]),
  paymentMethod: z.string().min(1, "Payment method is required"),
  startDate: z.string().min(1, "Start date is required"),
  reminderDays: z.number().min(0).max(30),
  icon: z.string().optional(),
});

type SubscriptionFormData = z.infer<typeof subscriptionSchema>;

export default function CreateSubscriptionScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);
  const insets = useSafeAreaInsets();
  const { selectedSubscription, setSelectedSubscription } = useSubscription();

  useEffect(() => {
    if (
      !selectedSubscription ||
      !selectedSubscription.name ||
      !selectedSubscription.icon
    ) {
      router.replace("/(tabs)/subscription-list");
    }
  }, [selectedSubscription]);

  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [cyclePickerOpen, setCyclePickerOpen] = useState(false);
  const [reminderPickerOpen, setReminderPickerOpen] = useState(false);
  const [planPickerOpen, setPlanPickerOpen] = useState(false);
  const [paymentPickerOpen, setPaymentPickerOpen] = useState(false);

  const today = new Date();
  const maxStartDate = addDays(today, 7);

  const { handleSubmit, setValue, watch, reset } =
    useForm<SubscriptionFormData>({
      resolver: zodResolver(subscriptionSchema),
      mode: "onChange",
      defaultValues: {
        name: selectedSubscription?.name || "",
        plan: "",
        price: selectedSubscription?.price || 0,
        currency: "USD",
        frequency: "monthly",
        startDate: toApiDate(today),
        paymentMethod: "",
        reminderDays: 3,
      },
    });

  const frequency = watch("frequency");
  const reminderDays = watch("reminderDays");
  const startDate = watch("startDate");
  const planName = watch("plan");
  const watchedName = watch("name");
  const watchedPayment = watch("paymentMethod");

  const isFormReady =
    !isLoading &&
    watchedName.trim().length >= 2 &&
    watchedPayment.trim().length > 0;
  const selectedPlan = selectedSubscription?.plans?.find(
    (p) => p.planName === planName,
  );

  useFocusEffect(
    useCallback(() => {
      return () => {
        if (AppState.currentState === "active") {
          setSelectedSubscription(null);
          reset({
            name: "",
            plan: "",
            price: 0,
            currency: "USD",
            frequency: "monthly",
            startDate: toApiDate(new Date()),
            paymentMethod: "",
            reminderDays: 3,
          });
        }
      };
    }, [setSelectedSubscription, reset]),
  );

  useEffect(() => {
    if (selectedSubscription) {
      setValue("name", selectedSubscription.name);
      if (selectedSubscription.price)
        setValue("price", selectedSubscription.price);

      if (selectedSubscription.plans?.length === 1) {
        const plan = selectedSubscription.plans[0];
        setValue("plan", plan.planName);
        setValue("price", plan.price);
        const dur = plan.duration.toLowerCase();
        if (dur.includes("month")) setValue("frequency", "monthly");
        else if (dur.includes("year")) setValue("frequency", "yearly");
        else if (dur.includes("quarter")) setValue("frequency", "quarterly");
      }
    }
  }, [selectedSubscription, setValue]);

  const handleBack = () => {
    router.push("/(tabs)/subscription-list");
  };

  const mutation = useMutation({
    mutationFn: subscriptionsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subscriptions", user?._id] });
      Toast.show({
        type: "success",
        text1: "Success",
        text2: "Subscription added!",
      });
      setTimeout(() => router.back(), 1000);
    },
    onError: (error: any) => {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: error.response?.data?.message || "Failed to add subscription",
      });
    },
  });

  const onSubmit = async (data: SubscriptionFormData) => {
    setIsLoading(true);
    try {
      let renewalDate = new Date(data.startDate);
      if (data.frequency === "monthly")
        renewalDate.setMonth(renewalDate.getMonth() + 1);
      else if (data.frequency === "quarterly")
        renewalDate.setMonth(renewalDate.getMonth() + 3);
      else if (data.frequency === "yearly")
        renewalDate.setFullYear(renewalDate.getFullYear() + 1);
      await mutation.mutateAsync({
        ...data,
        category: (selectedSubscription?.category as any) || "other",
        renewalDate: toApiDate(renewalDate),
        status: "active",
        icon: selectedSubscription?.icon || "",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const frequencies = [
    { label: "Monthly", value: "monthly" },
    { label: "Quarterly", value: "quarterly" },
    { label: "Yearly", value: "yearly" },
  ];

  const reminders = [
    { label: "Same day", value: 0 },
    { label: "1 day before", value: 1 },
    { label: "3 days before", value: 3 },
    { label: "1 week before", value: 7 },
  ];

  const paymentMethods = [
    "Credit Card",
    "Apple Pay",
    "Google Pay",
    "PayPal",
    "Bank Transfer",
    "Cash",
  ];

  return (
    <ThemedView style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <BackButton onPress={handleBack} />
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.heroSection}>
          {selectedSubscription?.icon ? (
            <Image
              source={{ uri: selectedSubscription.icon }}
              style={styles.logo}
            />
          ) : (
            <View style={styles.placeholderIcon}>
              <ThemedText style={styles.placeholderText}>
                {selectedSubscription?.name?.[0] || "?"}
              </ThemedText>
            </View>
          )}
          <ThemedText style={styles.subscriptionName}>
            {watch("name")}
          </ThemedText>
        </View>

        <View style={styles.form}>
          <TouchableOpacity
            style={styles.fieldRow}
            onPress={() => setDatePickerOpen(true)}
          >
            <ThemedText style={styles.fieldLabel}>Started on</ThemedText>
            <ThemedText style={styles.fieldValue}>
              {format(parseApiDate(startDate), "MMM d, yyyy")}
            </ThemedText>
          </TouchableOpacity>

          {selectedSubscription?.plans &&
            selectedSubscription.plans.length > 0 && (
              <TouchableOpacity
                style={styles.fieldRow}
                onPress={() => setPlanPickerOpen(true)}
              >
                <ThemedText style={styles.fieldLabel}>Plan</ThemedText>
                <View style={styles.pickerTrigger}>
                  <ThemedText style={styles.fieldValue}>
                    {planName || "Select a plan"}
                  </ThemedText>
                  <Ionicons
                    name="chevron-forward"
                    size={14}
                    color="#9BA1A6"
                    style={{ marginLeft: 4 }}
                  />
                </View>
              </TouchableOpacity>
            )}

          <View style={styles.fieldRow}>
            <ThemedText style={styles.fieldLabel}>Price</ThemedText>
            <View style={styles.priceInputContainer}>
              <ThemedText style={styles.fieldValue}>
                {watch("price")}
              </ThemedText>
              <ThemedText style={styles.currencyLabel}>USD</ThemedText>
            </View>
          </View>

          <TouchableOpacity
            style={styles.fieldRow}
            onPress={() =>
              !selectedSubscription?.plans && setCyclePickerOpen(true)
            }
            activeOpacity={selectedSubscription?.plans ? 1 : 0.7}
          >
            <ThemedText style={styles.fieldLabel}>Duration</ThemedText>
            <View style={styles.priceInputContainer}>
              <ThemedText style={styles.fieldValue}>
                {selectedPlan?.duration ||
                  (frequency
                    ? frequency.charAt(0).toUpperCase() + frequency.slice(1)
                    : "Monthly")}
              </ThemedText>
              {!selectedSubscription?.plans && (
                <Ionicons
                  name="chevron-down"
                  size={14}
                  color="#9BA1A6"
                  style={{ marginLeft: 4 }}
                />
              )}
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.fieldRow}
            onPress={() => setPaymentPickerOpen(true)}
          >
            <ThemedText style={styles.fieldLabel}>Payment</ThemedText>
            <View style={styles.pickerTrigger}>
              <ThemedText style={styles.fieldValue}>
                {watch("paymentMethod") || "Select method"}
              </ThemedText>
              <Ionicons
                name="chevron-down"
                size={14}
                color="#9BA1A6"
                style={{ marginLeft: 4 }}
              />
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.fieldRow, { borderBottomWidth: 0 }]}
            onPress={() => setReminderPickerOpen(true)}
          >
            <ThemedText style={styles.fieldLabel}>Remind me</ThemedText>
            <View style={styles.pickerTrigger}>
              <ThemedText style={styles.fieldValue}>
                {reminderDays === 0
                  ? "Same day"
                  : `${reminderDays} days before`}
              </ThemedText>
              <Ionicons
                name="chevron-down"
                size={14}
                color="#9BA1A6"
                style={{ marginLeft: 4 }}
              />
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 20 }]}>
        <TouchableOpacity
          style={[styles.addButton, !isFormReady && { opacity: 0.4 }]}
          onPress={handleSubmit(onSubmit)}
          disabled={!isFormReady}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <ThemedText style={styles.addButtonText}>
              Add Subscription
            </ThemedText>
          )}
        </TouchableOpacity>
      </View>

      {datePickerOpen && (
        <DateTimePicker
          value={parseApiDate(startDate)}
          mode="date"
          minimumDate={today}
          maximumDate={maxStartDate}
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={(_, date) => {
            setDatePickerOpen(false);
            if (date) setValue("startDate", toApiDate(date));
          }}
        />
      )}

      <Modal visible={cyclePickerOpen} transparent animationType="fade">
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setCyclePickerOpen(false)}
        >
          <View style={styles.modalContent}>
            {frequencies.map((f) => (
              <TouchableOpacity
                key={f.value}
                style={styles.modalOption}
                onPress={() => {
                  setValue("frequency", f.value as any);
                  setCyclePickerOpen(false);
                }}
              >
                <ThemedText
                  style={[
                    styles.modalOptionText,
                    frequency === f.value && { color: "#4649E5" },
                  ]}
                >
                  {f.label}
                </ThemedText>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      <Modal visible={reminderPickerOpen} transparent animationType="fade">
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setReminderPickerOpen(false)}
        >
          <View style={styles.modalContent}>
            {reminders.map((r) => (
              <TouchableOpacity
                key={r.value}
                style={styles.modalOption}
                onPress={() => {
                  setValue("reminderDays", r.value);
                  setReminderPickerOpen(false);
                }}
              >
                <ThemedText
                  style={[
                    styles.modalOptionText,
                    reminderDays === r.value && { color: "#4649E5" },
                  ]}
                >
                  {r.label}
                </ThemedText>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      <Modal visible={planPickerOpen} transparent animationType="fade">
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setPlanPickerOpen(false)}
        >
          <View style={styles.modalContent}>
            <View
              style={{
                padding: 16,
                borderBottomWidth: 1,
                borderBottomColor: "#1A1A2E",
              }}
            >
              <ThemedText
                style={{
                  fontSize: 18,
                  fontFamily: FontFamily.bold,
                  color: "#fff",
                  textAlign: "center",
                }}
              >
                Select Plan
              </ThemedText>
            </View>
            <ScrollView style={{ maxHeight: 300 }}>
              {selectedSubscription?.plans?.map((p) => (
                <TouchableOpacity
                  key={p.planName}
                  style={[
                    styles.modalOption,
                    { borderBottomWidth: 1, borderBottomColor: "#101019" },
                  ]}
                  onPress={() => {
                    setValue("plan", p.planName);
                    setValue("price", p.price);
                    const dur = p.duration.toLowerCase();
                    if (dur.includes("month")) setValue("frequency", "monthly");
                    else if (dur.includes("year"))
                      setValue("frequency", "yearly");
                    else if (dur.includes("quarter"))
                      setValue("frequency", "quarterly");
                    setPlanPickerOpen(false);
                  }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      width: "100%",
                      paddingHorizontal: 10,
                    }}
                  >
                    <View>
                      <ThemedText
                        style={[
                          styles.modalOptionText,
                          planName === p.planName && { color: "#4649E5" },
                        ]}
                      >
                        {p.planName}
                      </ThemedText>
                      <ThemedText style={{ fontSize: 12, color: "#9BA1A6" }}>
                        {p.duration}
                      </ThemedText>
                    </View>
                    <ThemedText
                      style={{
                        fontSize: 16,
                        fontFamily: FontFamily.bold,
                        color: "#fff",
                      }}
                    >
                      ${p.price}
                    </ThemedText>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>

      <Modal visible={paymentPickerOpen} transparent animationType="fade">
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setPaymentPickerOpen(false)}
        >
          <View style={styles.modalContent}>
            <View
              style={{
                padding: 16,
                borderBottomWidth: 1,
                borderBottomColor: "#1A1A2E",
              }}
            >
              <ThemedText
                style={{
                  fontSize: 18,
                  fontFamily: FontFamily.bold,
                  color: "#fff",
                  textAlign: "center",
                }}
              >
                Select Payment Method
              </ThemedText>
            </View>
            <ScrollView style={{ maxHeight: 300 }}>
              {paymentMethods.map((method) => (
                <TouchableOpacity
                  key={method}
                  style={[
                    styles.modalOption,
                    { borderBottomWidth: 1, borderBottomColor: "#101019" },
                  ]}
                  onPress={() => {
                    setValue("paymentMethod", method);
                    setPaymentPickerOpen(false);
                  }}
                >
                  <ThemedText
                    style={[
                      styles.modalOptionText,
                      watch("paymentMethod") === method && { color: "#4649E5" },
                    ]}
                  >
                    {method}
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    </ThemedView>
  );
}

const styles = createSubscriptionStyles;
