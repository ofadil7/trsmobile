import { Slot } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { Provider } from 'react-redux';
import { store } from '../store';
import { useAppSelector } from '../store/hooks';
import { initFCM } from '@/store/firebase/fcmService';
import { ResponsiveLayout } from './components/ResponsiveLayout';
import { SideBar } from './components/Sidebar';
import { TopBar } from './components/TopBar';
import { TopBarProvider, useTopBar } from '../contexts/TopBarContext';
import { WebMetaTags } from './components/WebMetaTags';
import { styles } from '../constants/Styles';

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
  const userId = useAppSelector(state => state.auth.auth?.id);

  useEffect(() => {
    if (Platform.OS !== 'web' && userId) {
      initFCM(userId);
    }
  }, [userId]);

  const { hideTopBar } = useTopBar();
  const { isAuthenticated } = useAppSelector(state => state.auth);

  return (
    <ResponsiveLayout style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right', 'bottom']}>
        {!hideTopBar && isAuthenticated && <TopBar onOpenSidebar={() => setSidebarOpen(true)} />}
        <SideBar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <Slot />
      </SafeAreaView>
    </ResponsiveLayout>
  );
}
