// components/ResponsiveImage.tsx
import React from 'react';
import { Image, ImageProps, ImageStyle, Platform, StyleProp, StyleSheet } from 'react-native';

interface ResponsiveImageProps extends ImageProps {
  width?: number;
  height?: number;
  style?: StyleProp<ImageStyle>;
}

export const ResponsiveImage: React.FC<ResponsiveImageProps> = ({
  width,
  height,
  style,
  ...props
}) => {
  const imageStyle: StyleProp<ImageStyle> = [
    styles.image,
    width ? { width } : {},
    height ? { height } : {},
    style,
  ];

  return <Image {...props} style={imageStyle} resizeMode='contain' />;
};

const styles = StyleSheet.create({
  image: {
    width: '100%',
    aspectRatio: 1,
    height: undefined,
    ...(Platform.OS === 'web'
      ? {
          display: 'block' as any,
          maxWidth: '100%' as any,
          height: 'auto' as any,
        }
      : {}),
  },
});
