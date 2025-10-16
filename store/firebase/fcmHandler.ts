import messaging from '@react-native-firebase/messaging';
import * as Notifications from 'expo-notifications';

// Background messages
messaging().setBackgroundMessageHandler(async (remoteMessage) => {
  console.log('📩 Message handled in background:', remoteMessage);
  const { title, body } = remoteMessage.notification || {};
  if (title && body) {
    await Notifications.scheduleNotificationAsync({
      content: { title, body },
      trigger: null,
    });
  }
});

// When app is in foreground
messaging().onMessage(async (remoteMessage) => {
  console.log('📱 Foreground message:', remoteMessage);
  const { title, body } = remoteMessage.notification || {};
  if (title && body) {
    await Notifications.scheduleNotificationAsync({
      content: { title, body },
      trigger: null,
    });
  }
});
