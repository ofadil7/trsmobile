import React from 'react';
import { Platform, StatusBar as RNStatusBar, StatusBarProps } from 'react-native';

/**
 * Cross-platform StatusBar component
 * Handles iOS and Android defaults
 */
interface Props extends StatusBarProps {
  backgroundColor?: string;
}

export const StatusBar: React.FC<Props> = ({ backgroundColor = '#FFFFFF', ...props }) => {
  return Platform.OS === 'android' ? (
    <RNStatusBar
      backgroundColor={backgroundColor}
      barStyle={props.barStyle || 'dark-content'}
      {...props}
    />
  ) : (
    <RNStatusBar barStyle={props.barStyle || 'dark-content'} {...props} />
  );
};
