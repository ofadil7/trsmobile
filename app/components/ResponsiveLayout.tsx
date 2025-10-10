import React, { ReactNode } from 'react';
import { Platform, StyleSheet, View, ViewStyle } from 'react-native';
import { isWeb } from '../../utils/platform';

interface ResponsiveLayoutProps {
  children: ReactNode;
  container?: boolean;
  style?: ViewStyle;
  responsive?: {
    web?: { style?: ViewStyle };
    ios?: { style?: ViewStyle };
    android?: { style?: ViewStyle };
  };
}

export const ResponsiveLayout: React.FC<ResponsiveLayoutProps> = ({
  children,
  container = false,
  style,
  responsive = {},
}) => {
  let platformStyle: ViewStyle = {};

  if (isWeb && responsive.web?.style) platformStyle = responsive.web.style;
  if (Platform.OS === 'ios' && responsive.ios?.style) platformStyle = responsive.ios.style;
  if (Platform.OS === 'android' && responsive.android?.style)
    platformStyle = responsive.android.style;

  return <View style={[container && styles.container, style, platformStyle]}>{children}</View>;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
