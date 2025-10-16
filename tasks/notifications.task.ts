import * as Notifications from 'expo-notifications';
import * as TaskManager from 'expo-task-manager';
import * as Device from 'expo-device';

export async function registerForPushNotificationsAsync() {
  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      alert('Failed to get push token!');
      return null;
    }

    const token = (await Notifications.getExpoPushTokenAsync()).data;
    console.log('Expo push token:', token);
    return token;
  } else {
    alert('Must use physical device for push notifications');
    return null;
  }
}


const BACKGROUND_NOTIFICATION_TASK = 'BACKGROUND-NOTIFICATION-TASK';

TaskManager.defineTask(BACKGROUND_NOTIFICATION_TASK, async ({ data, error }) => {
  if (error) {
    console.error('Background notification error:', error);
    return;
  }
  if (data) {
    const { notification } = data as any;
    console.log('📩 Notification received in background:', notification);
    const { title, body } = notification.request.content;
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
      },
      trigger: null,
    });
  }
});

export async function registerBackgroundNotificationTask() {
  const isRegistered = await TaskManager.isTaskRegisteredAsync(BACKGROUND_NOTIFICATION_TASK);
  if (!isRegistered) {
    await Notifications.registerTaskAsync(BACKGROUND_NOTIFICATION_TASK);
  }
}
