import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const isWeb = Platform.OS === 'web';

// Constants for storage keys
const REMEMBER_ME_KEY = 'rememberMe';
const PERSISTENT_AUTH_KEY = 'persistentAuth';
const SESSION_AUTH_KEY = 'sessionAuth';

export async function saveToken(key: string, value: string, persistent: boolean = false) {
  if (isWeb) {
    const storage = persistent ? localStorage : sessionStorage;
    storage.setItem(key, value);

    if (key === 'auth') {
      const storageType = persistent ? 'local' : 'session';
      localStorage.setItem(REMEMBER_ME_KEY, storageType);
    }
  } else {
    await SecureStore.setItemAsync(key, value);
    if (key === 'auth' && persistent) {
      await SecureStore.setItemAsync(REMEMBER_ME_KEY, 'true');
    }
  }
}

export async function getToken(key: string): Promise<string | null> {
  if (isWeb) {
    const rememberMe = localStorage.getItem(REMEMBER_ME_KEY);
    const storage = rememberMe === 'local' ? localStorage : sessionStorage;
    return storage.getItem(key);
  } else {
    return await SecureStore.getItemAsync(key);
  }
}

export async function deleteToken(key: string) {
  if (isWeb) {
    localStorage.removeItem(key);
    sessionStorage.removeItem(key);
    if (key === 'auth') {
      localStorage.removeItem(REMEMBER_ME_KEY);
    }
  } else {
    await SecureStore.deleteItemAsync(key);
    if (key === 'auth') {
      await SecureStore.deleteItemAsync(REMEMBER_ME_KEY);
    }
  }
}

export async function getRememberMePreference(): Promise<boolean> {
  if (isWeb) {
    return localStorage.getItem(REMEMBER_ME_KEY) === 'local';
  } else {
    const value = await SecureStore.getItemAsync(REMEMBER_ME_KEY);
    return value === 'true';
  }
}
