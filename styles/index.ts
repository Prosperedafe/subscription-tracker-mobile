import { FontFamily } from "@/constants/theme";
import { StyleSheet } from "react-native";

export const homeStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#050511",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#050511",
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: FontFamily.bold,
    color: "#fff",
    marginBottom: 16,
    marginTop: 8,
  },
  subCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0B0B14",
    borderRadius: 24,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.04)",
  },
  subIconContainer: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0.03)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
    marginRight: 16,
  },
  subLogo: {
    width: 32,
    height: 32,
    resizeMode: "contain",
  },
  subPlaceholderIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "#4649E5",
    justifyContent: "center",
    alignItems: "center",
  },
  subPlaceholderText: {
    color: "#fff",
    fontSize: 14,
    fontFamily: FontFamily.bold,
  },
  subInfo: {
    flex: 1,
    gap: 2,
  },
  subName: {
    fontSize: 16,
    fontFamily: FontFamily.bold,
    color: "#fff",
    marginBottom: 2,
  },
  subDue: {
    fontSize: 14,
    fontFamily: FontFamily.medium,
    color: "#9BA1A6",
  },
  subPriceInfo: {
    alignItems: "flex-end",
  },
  subPrice: {
    fontSize: 16,
    fontFamily: FontFamily.bold,
    color: "#fff",
  },
  subFrequency: {
    fontSize: 12,
    fontFamily: FontFamily.regular,
    color: "#9BA1A6",
  },
  retryButton: {
    backgroundColor: "#4649E5",
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 16,
    marginTop: 20,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: FontFamily.bold,
  },
  errorText: {
    color: "#FD3464",
    fontSize: 16,
    fontFamily: FontFamily.medium,
    textAlign: "center",
    paddingHorizontal: 20,
  },
  emptyContainer: {
    alignItems: "center",
    marginTop: 40,
    backgroundColor: "rgba(255, 255, 255, 0.02)",
    padding: 30,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.04)",
  },
  emptyText: {
    fontSize: 16,
    fontFamily: FontFamily.medium,
    color: "#9BA1A6",
    textAlign: "center",
  },
});
