import { ColorSchemeName } from "react-native";

/**
 * Always returns 'dark' regardless of the device system theme.
 */
export function useColorScheme(): ColorSchemeName {
  return "dark";
}
