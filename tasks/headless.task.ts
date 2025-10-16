import * as BackgroundFetch from 'expo-background-fetch';
import * as Notifications from 'expo-notifications';
import * as TaskManager from 'expo-task-manager';
import { getToken } from '@/store/services/tokenService'; // your existing helper
import { API_BASE_URL } from '@/store/services/api';

export const HEADLESS_NOTIFICATION_TASK = 'HEADLESS_NOTIFICATION_TASK';

// 🔹 Define the background task
TaskManager.defineTask(HEADLESS_NOTIFICATION_TASK, async () => {
  try {
    console.log('🔄 Headless background task running...');

    const token = await getToken('jwt');
    if (!token) {
      console.log('❌ No auth token found, skipping notification fetch.');
      return BackgroundFetch.BackgroundFetchResult.NoData;
    }

    // 🔹 Fetch new notifications from your backend
    const response = await fetch(`${API_BASE_URL}/notifications/unread`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.error('❌ Failed to fetch notifications:', response.status);
      return BackgroundFetch.BackgroundFetchResult.Failed;
    }

    const data = await response.json();
    if (!Array.isArray(data) || data.length === 0) {
      console.log('✅ No new notifications.');
      return BackgroundFetch.BackgroundFetchResult.NoData;
    }

    // 🔹 Loop and show each new notification locally
    for (const notif of data) {
      const title = notif.title ?? 'Nouvelle notification';
      const body = notif.body ?? '';
      const redirectUrl = notif.redirectUrl ?? '';

      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data: { redirectUrl },
          sound: true,
          badge: 1,
        },
        trigger: null,
      });

      console.log('📩 Background notification displayed:', title);
    }

    return BackgroundFetch.BackgroundFetchResult.NewData;
  } catch (error) {
    console.error('💥 Headless notification task error:', error);
    return BackgroundFetch.BackgroundFetchResult.Failed;
  }
});

// 🔹 Register the background fetch task
export async function registerHeadlessNotificationTask() {
  const isRegistered = await TaskManager.isTaskRegisteredAsync(HEADLESS_NOTIFICATION_TASK);
  if (!isRegistered) {
    console.log('🧠 Registering HEADLESS_NOTIFICATION_TASK...');
    await BackgroundFetch.registerTaskAsync(HEADLESS_NOTIFICATION_TASK, {
      minimumInterval: 60 * 15, // every 15 minutes (minimum Android limit)
      stopOnTerminate: false, // continue after user closes app (Android)
      startOnBoot: true, // auto-start after reboot (Android)
    });
  }
}
