import React, { useEffect, useRef } from 'react';
import { Animated, Dimensions, Platform, StyleSheet, View } from 'react-native';

const { width: screenWidth } = Dimensions.get('window');

const Loading: React.FC = () => {
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const opacityAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(scaleAnim, { toValue: 1.1, duration: 750, useNativeDriver: true }),
          Animated.timing(opacityAnim, { toValue: 1, duration: 750, useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.timing(scaleAnim, { toValue: 0.9, duration: 750, useNativeDriver: true }),
          Animated.timing(opacityAnim, { toValue: 0.8, duration: 750, useNativeDriver: true }),
        ]),
      ]),
    ).start();
  }, [scaleAnim, opacityAnim]);

  const imageSize =
    Platform.OS === 'web' ? Math.min(120, screenWidth * 0.2) : Math.min(250, screenWidth * 0.5);

  return (
    <View style={styles.container}>
      <Animated.Image
        source={{ uri: 'http://trs.optimizehealthsolutions.ma/assets/trs-logo-CqWuv3a1.png' }}
        style={{
          width: imageSize,
          height: imageSize,
          borderRadius: 12,
          transform: [{ scale: scaleAnim }],
          opacity: opacityAnim,
        }}
        resizeMode='contain'
      />
    </View>
  );
};

export default Loading;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F7FAFF',
  },
});
