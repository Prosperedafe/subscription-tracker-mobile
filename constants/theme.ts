/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from 'react-native';

const tintColorLight = '#0a7ea4';
const tintColorDark = '#fff';

export const Colors = {
  light: {
    text: '#11181C',
    background: '#fff',
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: '#E4E4ED',
    background: '#050511',
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
    gradient: ['#050511', '#0A0A1A'],
  },
};

export const ButtonColors = {
  default: '#4649E5',
  disabled: '#',
  danger: '#FD3464',
  warning: '#F24747',
  success: '#4649E5',
  info: '#4649E5',
  light: '#4649E5',
  dark: '#4649E5',
  muted: '#4649E5',
  primary: '#4649E5',
}

export const ViewGradient = {
  colors: ['rgba(70, 73, 229, 0.4)',
    'rgba(242, 71, 71, 0)'] as const,
};

export const FontFamily = {
  regular: 'RedRose_400Regular',
  medium: 'RedRose_500Medium',
  semiBold: 'RedRose_600SemiBold',
  bold: 'RedRose_700Bold',
  light: 'RedRose_300Light',
};

export const Fonts = Platform.select({
  ios: {
    sans: FontFamily.regular,
    serif: FontFamily.regular,
    rounded: FontFamily.regular,
    mono: 'ui-monospace',
  },
  default: {
    sans: FontFamily.regular,
    serif: FontFamily.regular,
    rounded: FontFamily.regular,
    mono: 'monospace',
  },
  web: {
    sans: `'Red Rose', ${FontFamily.regular}, system-ui, sans-serif`,
    serif: `'Red Rose', ${FontFamily.regular}, serif`,
    rounded: `'Red Rose', ${FontFamily.regular}, sans-serif`,
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', monospace",
  },
});
