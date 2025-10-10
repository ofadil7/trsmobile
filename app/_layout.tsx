import { Slot } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { Provider } from 'react-redux';
import { styles } from '../constants/Styles';
import { TopBarProvider, useTopBar } from '../contexts/TopBarContext';
import { useNotifications } from '../hooks/useNotifications';
import { RootState, store } from '../store';
import { useAppSelector } from '../store/hooks';
import { backgroundSyncService } from '../tasks/backgroundSync.service';
import { registerBackgroundNotificationTask } from '../tasks/notifications.task';
import { ResponsiveLayout } from './components/ResponsiveLayout';
import { SideBar } from './components/Sidebar';
import { TopBar } from './components/TopBar';
import { WebMetaTags } from './components/WebMetaTags';

export default function RootLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <StatusBar style='dark' translucent backgroundColor='transparent' />
        <WebMetaTags
          title='TRS Mobile - Solution de brancarderie'
          description='Application mobile pour la gestion des transports et brancardage dans les établissements de santé'
          keywords='brancardage, transport, santé, mobile, TRS'
        />
        <TopBarProvider>
          <LayoutContent sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        </TopBarProvider>
      </SafeAreaProvider>
    </Provider>
  );
}

function LayoutContent({
  sidebarOpen,
  setSidebarOpen,
}: {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}) {
  useNotifications();

  useEffect(() => {
    // Initialize background services
    const initializeBackgroundServices = async () => {
      if (Platform.OS !== 'web') {
        await registerBackgroundNotificationTask();
        backgroundSyncService.startPeriodicSync(10 * 60 * 1000);
      }
    };

    initializeBackgroundServices();

    return () => {
      // Cleanup
      backgroundSyncService.stopPeriodicSync();
    };
  }, []);

  return (
    <ResponsiveLayout style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right', 'bottom']}>
        <TopBarWrapper onOpenSidebar={() => setSidebarOpen(true)} />
        <SideBar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <Slot />
      </SafeAreaView>
    </ResponsiveLayout>
  );
}

function TopBarWrapper({ onOpenSidebar }: { onOpenSidebar: () => void }) {
  const { hideTopBar } = useTopBar();
  const { isAuthenticated } = useAppSelector((state: RootState) => state.auth);
  if (hideTopBar || !isAuthenticated) return null;
  return <TopBar onOpenSidebar={onOpenSidebar} />;
}
