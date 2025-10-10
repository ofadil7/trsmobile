import { useEffect, useState } from 'react';
import { AppState } from 'react-native';
import { useChatHub } from './useChatHub';

export const useConnectionStatus = () => {
  const { isConnected, isConnecting } = useChatHub();
  const [appState, setAppState] = useState(AppState.currentState);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      setAppState(nextAppState);
    });

    return () => {
      subscription.remove();
    };
  }, []);

  const isActive = isConnected && appState === 'active';

  return {
    isConnected,
    isConnecting,
    isActive,
    appState,
  };
};
