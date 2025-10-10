import {
  fetchUnreadCount,
  fetchUserNotifications,
} from '@/store/features/notifications/notificationsSlice';
import { setToastOpen } from '@/store/features/toast/toastSlice';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { API_BASE_URL } from '@/store/services/api';
import { getToken } from '@/store/services/tokenService';
import { registerBackgroundNotificationTask } from '@/tasks/notifications.task';
import * as signalR from '@microsoft/signalr';
import * as Notifications from 'expo-notifications';
import { router } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState, AppStateStatus, Platform } from 'react-native';
import { getPorterById } from '../store/features/porters/portersSlice';

// Raw response from SignalR (matches backend)
export type NotificationResponse = {
  id: number;
  receiverId: number;
  payloadJson?: string | Record<string, unknown>;
  scheduledAt: string;
};

export type TicketCompletedPayload = {
  RequestId: number;
  PorterName?: string;
  EstimatedArrival?: string;
  OriginPoint?: string;
};

// Canonical normalized notification
export type NormalizedPayload = {
  title: string;
  body: string;
  redirectUrl: string;
  templateCode: string;
  processedAt: string;
  originalPayload: TicketCompletedPayload | null;
  userId?: string | number | null;
};

export function parseNotificationPayload(
  raw: NotificationResponse['payloadJson'],
): NormalizedPayload {
  if (!raw) {
    return {
      title: 'Sans titre',
      body: '',
      redirectUrl: '',
      templateCode: '',
      processedAt: new Date().toISOString(),
      originalPayload: null,
      userId: null,
    };
  }

  let parsed: Record<string, unknown>;
  if (typeof raw === 'string') {
    try {
      parsed = JSON.parse(raw) as Record<string, unknown>;
    } catch {
      return {
        title: 'Sans titre',
        body: '',
        redirectUrl: '',
        templateCode: '',
        processedAt: new Date().toISOString(),
        originalPayload: null,
        userId: null,
      };
    }
  } else {
    parsed = raw;
  }

  // Convert PascalCase → camelCase
  const normalized: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(parsed)) {
    const camelKey = key.charAt(0).toLowerCase() + key.slice(1);
    normalized[camelKey] = value;
  }

  // Fix: parse OriginalPayload if it's a string
  let originalPayload: TicketCompletedPayload | null = null;
  if (normalized.originalPayload) {
    if (typeof normalized.originalPayload === 'string') {
      try {
        originalPayload = JSON.parse(normalized.originalPayload) as TicketCompletedPayload;
      } catch {
        originalPayload = null;
      }
    } else if (typeof normalized.originalPayload === 'object') {
      originalPayload = normalized.originalPayload as TicketCompletedPayload;
    }
  }

  return {
    title: typeof normalized.title === 'string' ? normalized.title : 'Sans titre',
    body: typeof normalized.body === 'string' ? normalized.body : '',
    redirectUrl: typeof normalized.redirectUrl === 'string' ? normalized.redirectUrl : '',
    templateCode: typeof normalized.templateCode === 'string' ? normalized.templateCode : '',
    processedAt:
      typeof normalized.processedAt === 'string'
        ? normalized.processedAt
        : new Date().toISOString(),
    originalPayload,
    userId:
      typeof normalized.userId === 'string' || typeof normalized.userId === 'number'
        ? normalized.userId
        : null,
  };
}

export const useNotifications = () => {
  const [connection, setConnection] = useState<signalR.HubConnection | null>(null);
  const dispatch = useAppDispatch();
  const { auth } = useAppSelector((s) => s.auth);
  const appState = useRef(AppState.currentState);

  const sendLocalNotification = useCallback(
    async (payload: NormalizedPayload & { id: number }) => {
      try {
        if (Platform.OS === 'web') {
          // Web notifications
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(payload.title, {
              body: payload.body,
              icon: '/assets/images/trs-logo.png',
              tag: `trs-${payload.id}`,
            });
          }
          return;
        }

        // Mobile notifications
        await Notifications.scheduleNotificationAsync({
          content: {
            title: payload.title,
            body: payload.body,
            data: {
              id: payload.id,
              redirectUrl: payload.redirectUrl,
              templateCode: payload.templateCode,
            },
            sound: true,
            badge: 1,
          },
          trigger: null,
        });

        // Update badge count
        const currentBadgeCount = await Notifications.getBadgeCountAsync();
        await Notifications.setBadgeCountAsync(currentBadgeCount + 1);
      } catch (error) {
        console.error('Failed to send local notification:', error);
      }
    },
    [dispatch],
  );
  // Handle app state changes (foreground/background)
  useEffect(() => {
    const subscription = AppState.addEventListener(
      'change',
      async (nextAppState: AppStateStatus) => {
        if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
          // App came to foreground - refresh notifications
          console.log('App came to foreground, refreshing notifications...');
          if (auth?.id) {
            dispatch(fetchUserNotifications({}));
            dispatch(fetchUnreadCount());
          }
        } else if (nextAppState === 'background' || nextAppState === 'inactive') {
          // App going to background - ensure background tasks are registered
          console.log('App going to background, ensuring background tasks...');
          if (Platform.OS !== 'web') {
            await registerBackgroundNotificationTask();
          }
        }

        appState.current = nextAppState;
      },
    );

    return () => {
      subscription.remove();
    };
  }, [dispatch, auth]);

  // SignalR connection for real-time notifications
  useEffect(() => {
    let conn: signalR.HubConnection | null = null;
    let retryCount = 0;
    const maxRetries = 5;

    const startConnection = async () => {
      const token = await getToken('jwt');
      if (!token || !auth?.id) {
        console.warn('No token or auth found, skipping SignalR connection.');
        return;
      }

      conn = new signalR.HubConnectionBuilder()
        .withUrl(`${API_BASE_URL}/hub/notifications`, {
          accessTokenFactory: () => token,
        })
        .withAutomaticReconnect([0, 2000, 5000, 10000, 30000]) // Progressive retry
        .configureLogging(signalR.LogLevel.Warning)
        .build();

      conn.on('ReceiveNotification', async (payload: NotificationResponse) => {
        console.log('Received real-time notification:', payload);
        const parsed = parseNotificationPayload(payload.payloadJson);

        if (payload.receiverId === auth.id) {
          // Refresh notifications list
          dispatch(fetchUserNotifications({}));
          dispatch(fetchUnreadCount());

          // Update porter status if needed
          await dispatch(getPorterById(payload.receiverId)).unwrap();

          // Show toast
          dispatch(setToastOpen({ isOpen: true, message: `🔔 ${parsed.title}` }));

          // Send local notification (works in background too)
          await sendLocalNotification({ ...parsed, id: payload.id });
        }
      });

      conn.onreconnecting((error) => {
        console.log('SignalR reconnecting due to:', error);
        retryCount++;
        if (retryCount > maxRetries) {
          console.log('Max retries reached, stopping reconnection attempts');
          conn?.stop();
        }
      });

      conn.onreconnected((connectionId) => {
        console.log('SignalR reconnected with ID:', connectionId);
        retryCount = 0;
      });

      try {
        await conn.start();
        setConnection(conn);
        console.log('✅ SignalR connected');
        retryCount = 0;
      } catch (err) {
        console.error('❌ SignalR Connection Error:', err);

        // Retry connection after delay
        if (retryCount < maxRetries) {
          setTimeout(startConnection, 5000 * (retryCount + 1));
        }
      }
    };

    startConnection();

    return () => {
      if (conn) {
        conn.stop().then(() => {
          setConnection(null);
          console.log('SignalR connection stopped');
        });
      }
    };
  }, [dispatch, sendLocalNotification, auth]);

  // Enhanced Expo Notifications Setup
  useEffect(() => {
    const setupNotifications = async () => {
      if (Platform.OS === 'web') {
        // Request web notification permission
        if ('Notification' in window && Notification.permission === 'default') {
          await Notification.requestPermission();
        }
        return;
      }

      // Mobile notification setup
      await Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowAlert: true,
          shouldPlaySound: true,
          shouldSetBadge: true,
          shouldShowBanner: true,
          shouldShowList: true,
        }),
      });

      // Android notification channel
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#1D2E5C',
          sound: 'default',
        });

        // High priority channel for critical notifications
        await Notifications.setNotificationChannelAsync('high-priority', {
          name: 'High Priority',
          importance: Notifications.AndroidImportance.HIGH,
          vibrationPattern: [0, 500, 500, 500],
          lightColor: '#FF0000',
          sound: 'default',
        });
      }

      // Register background tasks
      await registerBackgroundNotificationTask();

      // Handle notification received in foreground
      const notificationReceivedSubscription = Notifications.addNotificationReceivedListener(
        (notification) => {
          console.log('Notification received in foreground:', notification);
          const { title, body } = notification.request.content;

          if (title) {
            dispatch(
              setToastOpen({
                isOpen: true,
                message: title,
              }),
            );
          }

          // Refresh notifications when one is received
          dispatch(fetchUserNotifications({}));
          dispatch(fetchUnreadCount());
        },
      );

      // Handle notification response (user tapped notification)
      const notificationResponseSubscription =
        Notifications.addNotificationResponseReceivedListener((response) => {
          const data = response.notification.request.content.data as any;
          console.log('Notification tapped:', data);

          if (data?.redirectUrl) {
            router.push(data.redirectUrl);
          } else if (data?.screen) {
            router.push(`/${data.screen}`);
          }
        });

      return () => {
        notificationReceivedSubscription.remove();
        notificationResponseSubscription.remove();
      };
    };

    setupNotifications();
  }, [dispatch]);

  // Background sync when app becomes active
  useEffect(() => {
    if (auth?.id) {
      // Initial load
      dispatch(fetchUserNotifications({}));
      dispatch(fetchUnreadCount());
    }
  }, [dispatch, auth]);

  return { connection };
};
