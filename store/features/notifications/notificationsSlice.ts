import api, { API_BASE_URL } from '@/store/services/api';
import { safeParsePayload } from '@/store/shared/SafeParseHelper';
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AxiosError } from 'axios';
import { AppDispatch } from '../..';
import {
  NotificationTarget,
  RegisterDeviceTokenRequest,
  SendBulkNotificationsRequest,
  SendNotificationRequest,
} from './notifications-schemas';

interface NotificationState {
  items: NotificationTarget[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
  deviceTokenRegistered: boolean;
}

const initialState: NotificationState = {
  items: [],
  unreadCount: 0,
  loading: false,
  error: null,
  deviceTokenRegistered: false,
};

interface ErrorResponse {
  message?: string;
}

// --------------------
// Thunks
// --------------------

// GET current user's notifications
export const fetchUserNotifications = createAsyncThunk<
  NotificationTarget[],
  { unreadOnly?: boolean; count?: number },
  { dispatch: AppDispatch; rejectValue: string }
>(
  'notifications/fetchUserNotifications',
  async ({ unreadOnly, count }, { dispatch, rejectWithValue }) => {
    try {
      const { data } = await api.get<NotificationTarget[]>(`${API_BASE_URL}/api/notifications`, {
        params: { unreadOnly, count },
      });

      const parsed = data.map(safeParsePayload);

      dispatch(fetchUnreadCount());
      return parsed;
    } catch (err: unknown) {
      const axiosError = err as AxiosError<ErrorResponse>;
      return rejectWithValue(
        axiosError.response?.data?.message || 'Erreur lors de la récupération des notifications',
      );
    }
  },
);

// GET unread count
export const fetchUnreadCount = createAsyncThunk<number, void, { rejectValue: string }>(
  'notifications/fetchUnreadCount',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get<{ count: number }>(
        `${API_BASE_URL}/api/notifications/unread-count`,
      );
      return data.count;
    } catch {
      return rejectWithValue('Erreur lors de la récupération du nombre non lus');
    }
  },
);

// Mark as read
export const markAsRead = createAsyncThunk<void, number, { rejectValue: string }>(
  'notifications/markAsRead',
  async (id, { rejectWithValue }) => {
    try {
      await api.post(`${API_BASE_URL}/api/notifications/${id}/read`, {});
    } catch {
      return rejectWithValue('Erreur lors du marquage comme lu');
    }
  },
);

// Mark all as read
export const markAllAsRead = createAsyncThunk<void, void, { rejectValue: string }>(
  'notifications/markAllAsRead',
  async (_, { rejectWithValue }) => {
    try {
      await api.post(`${API_BASE_URL}/api/notifications/mark-all-read`, {});
    } catch {
      return rejectWithValue('Erreur lors du marquage global comme lu');
    }
  },
);

// Send notification
export const sendNotification = createAsyncThunk<
  void,
  SendNotificationRequest,
  { rejectValue: string }
>('notifications/sendNotification', async (request, { rejectWithValue }) => {
  try {
    await api.post(`${API_BASE_URL}/api/notifications/send-by-template`, request);
  } catch {
    return rejectWithValue('Erreur lors de l’envoi de la notification');
  }
});

// Bulk send
export const sendBulkNotifications = createAsyncThunk<
  void,
  SendBulkNotificationsRequest,
  { rejectValue: string }
>('notifications/sendBulkNotifications', async (request, { rejectWithValue }) => {
  try {
    await api.post(`${API_BASE_URL}/api/notifications/send-bulk-by-template`, request);
  } catch {
    return rejectWithValue('Erreur lors de l’envoi en masse');
  }
});

// Register device token
export const registerDeviceToken = createAsyncThunk<
  void,
  RegisterDeviceTokenRequest,
  { rejectValue: string }
>('notifications/registerDeviceToken', async (request, { rejectWithValue }) => {
  try {
    await api.post(`${API_BASE_URL}/api/DeviceTokens/register`, request);
  } catch {
    return rejectWithValue('Erreur lors de l’enregistrement du device token');
  }
});

// Remove device token
export const removeDeviceToken = createAsyncThunk<
  void,
  RegisterDeviceTokenRequest,
  { rejectValue: string }
>('notifications/removeDeviceToken', async (request, { rejectWithValue }) => {
  try {
    await api.post(`${API_BASE_URL}/api/DeviceTokens/remove`, request);
  } catch {
    return rejectWithValue('Erreur lors de la suppression du device token');
  }
});

// --------------------
// Slice
// --------------------
const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    resetError: (state) => {
      state.error = null;
    },
    resetDeviceTokenStatus: (state) => {
      state.deviceTokenRegistered = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // Notifications
      .addCase(fetchUserNotifications.pending, (state) => {
        state.loading = true;
      })
      .addCase(
        fetchUserNotifications.fulfilled,
        (state, action: PayloadAction<NotificationTarget[]>) => {
          state.loading = false;
          state.items = action.payload;
        },
      )
      .addCase(fetchUserNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchUnreadCount.fulfilled, (state, action: PayloadAction<number>) => {
        state.unreadCount = action.payload;
      })
      .addCase(markAsRead.fulfilled, (state, action) => {
        const notif = state.items.find((n) => n.numero === action.meta.arg);
        if (notif) notif.isRead = true;
      })
      .addCase(markAllAsRead.fulfilled, (state) => {
        state.items.forEach((n) => (n.isRead = true));
        state.unreadCount = 0;
      })

      // Device token
      .addCase(registerDeviceToken.pending, (state) => {
        state.loading = true;
      })
      .addCase(registerDeviceToken.fulfilled, (state) => {
        state.loading = false;
        state.deviceTokenRegistered = true;
      })
      .addCase(registerDeviceToken.rejected, (state, action) => {
        state.loading = false;
        state.deviceTokenRegistered = false;
        state.error = action.payload as string;
      })
      .addCase(removeDeviceToken.pending, (state) => {
        state.loading = true;
      })
      .addCase(removeDeviceToken.fulfilled, (state) => {
        state.loading = false;
        state.deviceTokenRegistered = false;
      })
      .addCase(removeDeviceToken.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { resetError, resetDeviceTokenStatus } = notificationSlice.actions;
export default notificationSlice.reducer;
