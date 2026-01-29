import { ThemedText } from '@/components/themed-text';
import { Colors, FontFamily } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { BlurView } from 'expo-blur';
import React, { useState } from 'react';
import type { Control, FieldPath, FieldValues } from 'react-hook-form';
import { Controller } from 'react-hook-form';
import { Platform, StyleSheet, TextInput, TextInputProps, View } from 'react-native';

const INPUT_BORDER_DEFAULT = '#101019';
const INPUT_BORDER_FOCUSED = '#252532';
const BLUR_INTENSITY = 40;

export type FormInputProps<T extends FieldValues> = {
  control: Control<T>;
  name: FieldPath<T>;
  label: string;
  placeholder?: string;
  error?: string;
  secureTextEntry?: boolean;
  keyboardType?: TextInputProps['keyboardType'];
  autoCapitalize?: TextInputProps['autoCapitalize'];
  containerStyle?: object;
  valueAsDisplay?: (value: unknown) => string;
  onChangeTransform?: (text: string) => unknown;
};

export function FormInput<T extends FieldValues>({
  control,
  name,
  label,
  placeholder,
  error,
  secureTextEntry,
  keyboardType,
  autoCapitalize,
  containerStyle,
  valueAsDisplay,
  onChangeTransform,
}: FormInputProps<T>) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [isFocused, setIsFocused] = useState(false);

  const borderColor = isFocused ? INPUT_BORDER_FOCUSED : INPUT_BORDER_DEFAULT;

  return (
    <View style={[styles.container, containerStyle]}>
      <ThemedText style={styles.label}>{label}</ThemedText>
      <Controller
        control={control}
        name={name}
        render={({ field: { onChange, onBlur, value } }) => {
          const displayValue = valueAsDisplay ? valueAsDisplay(value) : (value ?? '');
          const handleChange = (text: string) => {
            onChange(onChangeTransform ? onChangeTransform(text) : text);
          };
          const handleBlur = () => {
            setIsFocused(false);
            onBlur();
          };
          return (
            <View style={[styles.inputWrapper, { borderColor }]}>
              <BlurView
                intensity={BLUR_INTENSITY}
                tint="dark"
                style={StyleSheet.absoluteFill}
                {...(Platform.OS === 'android' && { experimentalBlurMethod: 'dimezisBlurView' as const })}
              />
              <TextInput
                style={[
                  styles.input,
                  { color: colors.text, fontFamily: FontFamily.regular },
                ]}
                placeholder={placeholder}
                placeholderTextColor={colors.icon}
                value={typeof displayValue === 'string' ? displayValue : String(displayValue ?? '')}
                onFocus={() => setIsFocused(true)}
                onBlur={handleBlur}
                onChangeText={handleChange}
                secureTextEntry={secureTextEntry}
                keyboardType={keyboardType}
                autoCapitalize={autoCapitalize}
              />
            </View>
          );
        }}
      />
      {error ? <ThemedText style={styles.error}>{error}</ThemedText> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    fontWeight: '600',
    fontFamily: FontFamily.regular,
  },
  inputWrapper: {
    overflow: 'hidden',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: INPUT_BORDER_DEFAULT,
  },
  input: {
    padding: 12,
    fontSize: 16,
    backgroundColor: 'transparent',
    minHeight: 48,
  },
  error: {
    color: '#ff4444',
    fontSize: 12,
    marginTop: 4,
  },
});
