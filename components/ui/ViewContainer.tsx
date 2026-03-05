import { ReactNode } from "react";
import { StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ThemedView } from "../themed-view";

export const ViewContainer = ({
  children,
  style,
}: {
  children: ReactNode;
  style?: any;
}) => {
  const insets = useSafeAreaInsets();

  return (
    <ThemedView
      style={[
        styles.container,
        {
          paddingTop: insets.top + 10,
          paddingBottom: insets.bottom,
        },
        style,
      ]}
    >
      {children}
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#050511",
  },
});
