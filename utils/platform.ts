import { Dimensions, Platform } from 'react-native';

export const isWeb = Platform.OS === 'web';
export const isIOS = Platform.OS === 'ios';
export const isAndroid = Platform.OS === 'android';

export const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export const isTablet = () => {
  const { width, height } = Dimensions.get('window');
  const aspectRatio = height / width;
  return aspectRatio < 1.6;
};

export const isSmallScreen = () => {
  return screenWidth < 375;
};

export const isLargeScreen = () => {
  return screenWidth > 768;
};

export const getResponsiveValue = <T>(values: {
  small?: T;
  medium?: T;
  large?: T;
  web?: T;
  ios?: T;
  android?: T;
}): T | undefined => {
  if (isWeb && values.web) return values.web;
  if (isIOS && values.ios) return values.ios;
  if (isAndroid && values.android) return values.android;

  if (isSmallScreen() && values.small) return values.small;
  if (isLargeScreen() && values.large) return values.large;
  if (values.medium) return values.medium;

  return Object.values(values)[0];
};
