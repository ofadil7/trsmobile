import { setToastOpen } from '@/store/features/toast/toastSlice';
import api, { API_BASE_URL } from '@/store/services/api';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { AxiosError } from 'axios';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import { deleteToken, getToken, saveToken } from '../../services/tokenService';
import { registerDeviceToken, removeDeviceToken } from '../notifications/notificationsSlice';
import messaging from '@react-native-firebase/messaging';
import { initFCM } from '@/store/firebase/fcmService';

interface ErrorResponse {
  message?: string;
}

interface LoginRequest {
  username: string;
  password: string;
}

interface LoginResponse {
  name: string;
  email: string;
  role: string;
  id: number;
  token: string;
  requiresPasswordReset?: boolean;
}

interface AuthState {
  isAuthenticated: boolean;
  auth: LoginResponse | null;
  message: string | null;
  warning: string | null;
  error: string | null;
  loading: boolean;
  toastOpen: boolean;
}

// --- Initial state ---
let storedAuth: LoginResponse | null = null;
if (Platform.OS === 'web') {
  const raw = localStorage.getItem('auth');
  storedAuth = raw ? JSON.parse(raw) : null;
}

const initialState: AuthState = {
  isAuthenticated: !!storedAuth,
  auth: storedAuth,
  message: null,
  warning: null,
  error: null,
  loading: false,
  toastOpen: false,
};

async function getFCMToken(): Promise<string | null> {
  const authStatus = await messaging().requestPermission();
  const enabled =
    authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
    authStatus === messaging.AuthorizationStatus.PROVISIONAL;

  if (!enabled) {
    console.warn('Push notification permission not granted');
    return null;
  }

  const token = await messaging().getToken();
  console.log('✅ FCM Token:', token);
  return token;
}
// --- Thunks ---

export const login = createAsyncThunk<
  LoginResponse,
  LoginRequest & { rememberMe: boolean }, // Add rememberMe
  { rejectValue: string | { requiresPasswordReset: boolean } }
>('auth/login', async (loginRequest, { dispatch, rejectWithValue }) => {
  try {
    const { data } = await api.post<LoginResponse>(`${API_BASE_URL}/api/auth/login`, {
      username: loginRequest.username,
      password: loginRequest.password,
    });

    await saveToken('jwt', data.token, loginRequest.rememberMe);
    await saveToken('auth', JSON.stringify(data), loginRequest.rememberMe);
    await saveToken('id', data.id.toString(), loginRequest.rememberMe);
    await saveToken('email', data.email, loginRequest.rememberMe);

    await initFCM(data.id);

    dispatch(setToastOpen({ isOpen: true, message: 'Connexion réussie!' }));


    return data;
  } catch (error: unknown) {
    const axiosError = error as AxiosError<{ message?: string; requiresPasswordReset?: boolean }>;
    if (axiosError.response?.data?.requiresPasswordReset) {
      return rejectWithValue({ requiresPasswordReset: true });
    }
    const message = axiosError.response?.data?.message || 'Échec de la connexion.';
    dispatch(setToastOpen({ isOpen: true, error: message }));
    return rejectWithValue(message);
  }
});

export const logout = createAsyncThunk<string, boolean, { rejectValue: string }>(
  'auth/logout',
  async (forcedLogout, { rejectWithValue, dispatch }) => {
    try {
      const storedAuthStr = await getToken('auth');
      if (!storedAuthStr) return rejectWithValue('Aucun utilisateur connecté.');
      const storedAuth: LoginResponse = JSON.parse(storedAuthStr);

      const logoutRequest = { userName: storedAuth.email, forcedLogout };
      await api.post(`${API_BASE_URL}/api/auth/logout`, logoutRequest);

      const devicePush = await getToken('devicePush');
      if (devicePush) {
        await dispatch(
          removeDeviceToken({
            userId: storedAuth.id,
            token: devicePush,
            platform: Platform.OS === 'android' ? 'Android' : Platform.OS === 'ios' ? 'iOS' : 'Web',
          }),
        );
      }

      await deleteToken('auth');
      await deleteToken('jwt');
      await deleteToken('id');
      await deleteToken('email');
      await deleteToken('devicePush');

      dispatch(
        setToastOpen({
          isOpen: true,
          message: forcedLogout
            ? 'Vous avez été déconnecté car vous êtes connecté depuis un autre appareil.'
            : 'Déconnexion réussie!',
        }),
      );

      return 'Déconnexion réussie!';
    } catch (error: unknown) {
      const axiosError = error as AxiosError<ErrorResponse>;
      dispatch(setToastOpen({ isOpen: true, error: 'Échec de la déconnexion.' }));
      return rejectWithValue(axiosError?.response?.data?.message || 'Échec de la déconnexion.');
    }
  },
);

// --- Slice ---
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    cleanToken: (state) => {
      state.isAuthenticated = false;
      state.auth = null;
      deleteToken('auth');
      deleteToken('jwt');
      deleteToken('id');
      deleteToken('email');
      deleteToken('devicePush');
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.auth = action.payload;
        state.isAuthenticated = true;
        state.loading = false;
        state.error = null;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = typeof action.payload === 'string' ? action.payload : '';
      })
      .addCase(logout.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(logout.fulfilled, (state) => {
        state.auth = null;
        state.isAuthenticated = false;
        state.loading = false;
        state.error = null;
      })
      .addCase(logout.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Logout failed!';
      });
  },
});

export const { cleanToken } = authSlice.actions;
export default authSlice.reducer;
