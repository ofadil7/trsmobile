import React from 'react';
import { StyleProp, StyleSheet, TextInput, TextInputProps, TextStyle } from 'react-native';
import { getResponsiveValue } from '../../../utils/platform';

type ResponsiveSize = {
  small?: number;
  medium?: number;
  large?: number;
  web?: number;
  ios?: number;
  android?: number;
};

type InputProps = TextInputProps & {
  style?: StyleProp<TextStyle>;
  paddingVertical?: number | ResponsiveSize;
  paddingHorizontal?: number | ResponsiveSize;
  fontSize?: number | ResponsiveSize;
};

export const Input: React.FC<InputProps> = ({
  style,
  paddingVertical = { small: 8, medium: 12, large: 16, web: 14 },
  paddingHorizontal = { small: 12, medium: 16, large: 24 },
  fontSize = { small: 14, medium: 16, large: 18, web: 16 },
  ...props
}) => {
  const responsivePaddingVertical =
    typeof paddingVertical === 'number'
      ? paddingVertical
      : getResponsiveValue(paddingVertical) ?? 10;

  const responsivePaddingHorizontal =
    typeof paddingHorizontal === 'number'
      ? paddingHorizontal
      : getResponsiveValue(paddingHorizontal) ?? 12;

  const responsiveFontSize =
    typeof fontSize === 'number' ? fontSize : getResponsiveValue(fontSize) ?? 16;

  return (
    <TextInput
      {...props}
      style={[
        styles.input,
        {
          paddingVertical: responsivePaddingVertical,
          paddingHorizontal: responsivePaddingHorizontal,
          fontSize: responsiveFontSize,
        },
        style,
      ]}
    />
  );
};

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderColor: '#c2c3cd',
    borderRadius: 8,
    color: '#111827',
    backgroundColor: '#fff',
  },
});
