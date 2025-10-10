// components/Button.tsx
import React from 'react';
import { Pressable, StyleSheet, Text, TextStyle, ViewStyle } from 'react-native';
import { getResponsiveValue } from '../../../utils/platform';

type ButtonProps = {
  children: React.ReactNode;
  onPress?: () => void;
  disabled?: boolean;
  variant?: 'default' | 'outline';
  style?: ViewStyle;
  textStyle?: TextStyle;
  fullWidth?: boolean;
  paddingVertical?:
    | number
    | {
        small?: number;
        medium?: number;
        large?: number;
        web?: number;
        ios?: number;
        android?: number;
      };
  paddingHorizontal?:
    | number
    | {
        small?: number;
        medium?: number;
        large?: number;
        web?: number;
        ios?: number;
        android?: number;
      };
  fontSize?:
    | number
    | {
        small?: number;
        medium?: number;
        large?: number;
        web?: number;
        ios?: number;
        android?: number;
      };
};

export const Button: React.FC<ButtonProps> = ({
  children,
  onPress,
  disabled,
  variant = 'default',
  style,
  textStyle,
  fullWidth = false,
  paddingVertical = { small: 8, medium: 12, large: 16, web: 14 },
  paddingHorizontal = { small: 12, medium: 16, large: 24 },
  fontSize = { small: 14, medium: 16, large: 18, web: 16 },
}) => {
  const isOutline = variant === 'outline';

  const responsivePaddingVertical =
    typeof paddingVertical === 'number'
      ? paddingVertical
      : getResponsiveValue(paddingVertical) ?? 12;
  const responsivePaddingHorizontal =
    typeof paddingHorizontal === 'number'
      ? paddingHorizontal
      : getResponsiveValue(paddingHorizontal) ?? 16;
  const responsiveFontSize =
    typeof fontSize === 'number' ? fontSize : getResponsiveValue(fontSize) ?? 16;

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.button,
        isOutline ? styles.outline : styles.default,
        disabled && styles.disabled,
        fullWidth && { alignSelf: 'stretch' },
        {
          paddingVertical: responsivePaddingVertical,
          paddingHorizontal: responsivePaddingHorizontal,
          opacity: pressed ? 0.8 : 1,
        },
        style,
      ]}
    >
      <Text
        style={[
          styles.text,
          isOutline ? styles.outlineText : styles.defaultText,
          { fontSize: responsiveFontSize },
          textStyle,
        ]}
      >
        {children}
      </Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 4,
  },
  default: {
    backgroundColor: '#3657C3',
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#3657C3',
  },
  disabled: {
    opacity: 0.6,
  },
  text: {
    fontWeight: '600',
  },
  defaultText: {
    color: '#fff',
  },
  outlineText: {
    color: '#3657C3',
  },
});
