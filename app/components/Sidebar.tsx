import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { styles } from '../../constants/Styles';
import { logout } from '../../store/features/authentification/authSlice';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { isTablet } from '../../utils/platform';
import { ResponsiveImage } from './ResponsiveImage';

export function SideBar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { auth } = useAppSelector((state) => state.auth);
  const { workRoute } = useAppSelector((state) => state.workRoute);
  const router = useRouter();
  const dispatch = useAppDispatch();

  if (!open) return null;

  return (
    <View style={styles.overlay}>
      <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />
      <SafeAreaView style={styles.sidebar} edges={['top', 'left', 'right', 'bottom']}>
        {/* Header */}
        <View style={[styles.topBarContainer]}>
          <View style={styles.logoCircle}>
            <ResponsiveImage
              source={{ uri: 'http://trs.optimizehealthsolutions.ma/assets/trs-logo-CqWuv3a1.png' }}
              width={isTablet() ? 50 : 40}
              height={isTablet() ? 50 : 40}
              style={styles.image}
            />
          </View>
          <View style={{ marginLeft: 8 }}>
            <Text style={styles.title}>TRS</Text>
            <Text style={styles.subtitle}>Solution de brancarderie</Text>
          </View>
          <TouchableOpacity accessibilityLabel='Fermer' onPress={onClose} style={styles.closeBtn}>
            <Ionicons name='close' size={isTablet() ? 24 : 20} color='#111827' />
          </TouchableOpacity>
        </View>

        {/* Menu */}
        <View style={styles.menu}>
          <SidebarItem
            icon={<Ionicons name='home' size={18} color='#1F2937' />}
            label='Tableau de bord'
            onPress={() => {
              router.push('/');
              onClose();
            }}
          />
          <SidebarItem
            icon={<MaterialIcons name='notifications-none' size={18} color='#1F2937' />}
            label='Notifications'
            onPress={() => {
              router.push('/notifications');
              onClose();
            }}
          />
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <View style={styles.userBlock}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {(auth?.name || 'AM')
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .slice(0, 2)}
              </Text>
            </View>
            <View style={{ marginLeft: 8 }}>
              <Text style={styles.userName}>{auth?.name || 'Utilisateur'}</Text>
              <Text style={styles.userRole}>{auth?.role || 'Administrateur'}</Text>
            </View>
          </View>

          <TouchableOpacity
            accessibilityLabel='Déconnexion'
            disabled={!!workRoute}
            onPress={() => {
              if (workRoute) return;
              dispatch(logout(false)).then(() => router.replace('/login'));
              onClose();
            }}
            style={[styles.logoutBtn, !!workRoute && styles.disabledBtn]}
          >
            <MaterialIcons name='logout' size={20} color={workRoute ? '#9CA3AF' : '#EF4444'} />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}

function SidebarItem({
  icon,
  label,
  onPress,
}: {
  icon: React.ReactNode;
  label: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity onPress={onPress} style={styles.menuItem}>
      <View style={styles.menuIcon}>{icon}</View>
      <Text style={styles.menuLabel}>{label}</Text>
    </TouchableOpacity>
  );
}
