import { ThemedText } from '@/components/themed-text';
import { ButtonColors, FontFamily } from '@/constants/theme';
import React from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  TouchableOpacityProps,
  ViewStyle,
} from 'react-native';

export type AppButtonProps = TouchableOpacityProps & {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  backgroundColor?: string;
  style?: ViewStyle;
  textStyle?: object;
};

export function AppButton({
  title,
  onPress,
  loading = false,
  disabled = false,
  backgroundColor = ButtonColors.default,
  style,
  textStyle,
  ...rest
}: AppButtonProps) {
  return (
    <TouchableOpacity
      style={[styles.button, { backgroundColor, opacity: disabled || loading ? 0.5 : 1 }, style]}
      onPress={onPress}
      disabled={disabled || loading}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator color="#fff" />
      ) : (
        <ThemedText style={[styles.buttonText, textStyle]}>{title}</ThemedText>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 40,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: FontFamily.regular,
  },
});