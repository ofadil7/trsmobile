// services/backgroundSync.service.ts
import { API_BASE_URL } from '@/store/services/api';
import { getToken } from '@/store/services/tokenService';

export class BackgroundSyncService {
  private static instance: BackgroundSyncService;
  private syncInterval: NodeJS.Timeout | null = null;

  static getInstance(): BackgroundSyncService {
    if (!BackgroundSyncService.instance) {
      BackgroundSyncService.instance = new BackgroundSyncService();
    }
    return BackgroundSyncService.instance;
  }

  async syncNotifications(): Promise<boolean> {
    try {
      const token = await getToken('jwt');
      if (!token) return false;

      const response = await fetch(`${API_BASE_URL}/api/notifications/unread`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const notifications = await response.json();
        return notifications.length > 0;
      }
      return false;
    } catch (error) {
      console.error('Background sync failed:', error);
      return false;
    }
  }

  startPeriodicSync(interval: number = 15 * 60 * 1000) {
    // 15 minutes default
    if (this.syncInterval) {
      this.stopPeriodicSync();
    }

    this.syncInterval = setInterval(async () => {
      await this.syncNotifications();
    }, interval);
  }

  stopPeriodicSync() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }
}

export const backgroundSyncService = BackgroundSyncService.getInstance();
