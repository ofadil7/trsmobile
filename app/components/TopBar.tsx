import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { usePathname, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { styles } from '../../constants/Styles';
import { logout } from '../../store/features/authentification/authSlice';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { isTablet } from '../../utils/platform';
import { ResponsiveImage } from './ResponsiveImage';

function formatFrenchDateTimeLocal(date: Date) {
  return date.toLocaleString('fr-FR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export const TopBar = ({ onOpenSidebar }: { onOpenSidebar?: () => void }) => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const route = usePathname();
  const isNotifications = route === '/notifications';
  const workRoute = useAppSelector((state) => state.workRoute.workRoute);
  const unreadCount = useAppSelector((state) => state.notifications.unreadCount);

  const [dateTimeNow, setDateTimeNow] = useState(formatFrenchDateTimeLocal(new Date()));

  useEffect(() => {
    const interval = setInterval(() => {
      setDateTimeNow(formatFrenchDateTimeLocal(new Date()));
    }, 1000);
    return () => clearInterval(interval);
  }, [dateTimeNow]);

  return (
    <View style={[styles.topBarContainer]}>
      {/* Left: Menu + Logo */}
      <TouchableOpacity accessibilityLabel='Menu' onPress={onOpenSidebar} style={styles.menuBtn}>
        <ResponsiveImage
          source={{ uri: 'http://trs.optimizehealthsolutions.ma/assets/trs-logo-CqWuv3a1.png' }}
          width={isTablet() ? 50 : 40}
          height={isTablet() ? 50 : 40}
          style={styles.TobBarlogo}
        />
      </TouchableOpacity>

      {/* Center: Title + Time */}
      <TouchableOpacity style={styles.center} onPress={() => router.push('/')}>
        <Text style={[styles.TobBartitle, isTablet() && styles.TobBartabletTitle]}>
          Système de Brancardage
        </Text>
        <Text style={[styles.TobBarsubtitle, isTablet() && styles.TobBartabletSubtitle]}>
          {dateTimeNow.charAt(0).toUpperCase() + dateTimeNow.slice(1)}
        </Text>
      </TouchableOpacity>

      {/* Right: Notifications + Logout */}
      <View style={styles.actions}>
        <TouchableOpacity
          accessibilityLabel='Notifications'
          style={[styles.iconBtn, isNotifications && styles.iconBtnActive]}
          onPress={() => router.push(isNotifications ? '/' : '/notifications')}
        >
          <Ionicons
            name='notifications'
            size={20}
            color={isNotifications ? '#FFFFFF' : '#111827'}
          />
          {unreadCount > 0 && (
            <View style={styles.TobBarbadge}>
              <Text style={styles.TobBarbadgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
            </View>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          accessibilityLabel='Déconnexion'
          disabled={!!workRoute}
          onPress={() => {
            if (workRoute) return;
            dispatch(logout(false)).then(() => router.replace('/login'));
          }}
          style={[styles.iconBtn, !!workRoute && styles.disabled]}
        >
          <MaterialIcons name='logout' size={20} color={workRoute ? '#9CA3AF' : '#111827'} />
        </TouchableOpacity>
      </View>
    </View>
  );
};
