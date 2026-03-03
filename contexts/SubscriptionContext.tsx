import React, { createContext, useContext, useState } from "react";

interface SubscriptionPlan {
  planName: string;
  price: number;
  duration: string;
}

interface SelectedSubscription {
  name: string;
  icon?: string;
  price?: number;
  category?: string;
  plans?: SubscriptionPlan[];
}

interface SubscriptionContextType {
  selectedSubscription: SelectedSubscription | null;
  setSelectedSubscription: (sub: SelectedSubscription | null) => void;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(
  undefined,
);

export function SubscriptionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [selectedSubscription, setSelectedSubscription] =
    useState<SelectedSubscription | null>(null);

  return (
    <SubscriptionContext.Provider
      value={{ selectedSubscription, setSelectedSubscription }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription() {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error(
      "useSubscription must be used within a SubscriptionProvider",
    );
  }
  return context;
}
