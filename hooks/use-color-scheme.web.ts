import { ColorSchemeName } from "react-native";

/**
 * Always returns 'dark' regardless of the device system theme.
 * Web version — static rendering safe.
 */
export function useColorScheme(): ColorSchemeName {
  return "dark";
}
