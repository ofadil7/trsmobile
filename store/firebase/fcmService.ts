import { Platform, Alert } from 'react-native';
import messaging from '@react-native-firebase/messaging';
import { store } from '@/store';
import { registerDeviceToken } from '@/store/features/notifications/notificationsSlice';
import { saveToken } from '../services/tokenService';

let isFCMInitialized = false;

// Request notification permission (Android 13+ and iOS)
async function requestUserPermission(): Promise<boolean> {
  const authStatus = await messaging().requestPermission();
  const enabled =
    authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
    authStatus === messaging.AuthorizationStatus.PROVISIONAL;

  console.log('Notification permission enabled?', enabled);
  return enabled;
}

// Handle background messages
messaging().setBackgroundMessageHandler(async remoteMessage => {
  console.log('🔔 Background message received:', remoteMessage);
});

export const initFCM = async (userId: number) => {
  if (Platform.OS === 'web' || isFCMInitialized || !userId) return;

  try {
    const permissionGranted = await requestUserPermission();
    if (!permissionGranted) {
      console.warn('🚫 Notification permission not granted!');
      return;
    }

    // Get FCM token
    const token = await messaging().getToken();
    if (!token) {
      console.warn('🚫 FCM token is null');
      return;
    }

    console.log('✅ FCM token:', token);

    // Save token locally
    await saveToken('devicePush', token);

    // Register token in Redux store
    store.dispatch(
      registerDeviceToken({
        userId,
        token,
        platform: Platform.OS === 'android' ? 'Android' : 'iOS',
      })
    );

    // Listen for token refresh
    messaging().onTokenRefresh(async newToken => {
      console.log('🔄 FCM token refreshed:', newToken);
      await saveToken('devicePush', newToken);
      store.dispatch(
        registerDeviceToken({
          userId,
          token: newToken,
          platform: Platform.OS === 'android' ? 'Android' : 'iOS',
        })
      );
    });

    // Listen for foreground messages
    messaging().onMessage(async remoteMessage => {
      console.log('📲 Foreground message received:', remoteMessage);
      Alert.alert(
        remoteMessage.notification?.title ?? 'Notification',
        remoteMessage.notification?.body ?? ''
      );
    });

    isFCMInitialized = true;
    console.log('📱 FCM initialized successfully');
  } catch (error) {
    console.error('❌ initFCM failed:', error);
  }
};
