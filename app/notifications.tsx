import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { FlatList, Pressable, SafeAreaView, Text, TouchableOpacity, View } from 'react-native';
import { styles } from '../constants/Styles';
import { NotificationTarget } from '../store/features/notifications/notifications-schemas';
import {
  fetchUserNotifications,
  markAsRead,
} from '../store/features/notifications/notificationsSlice';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import Loading from './components/ui/loading';

export default function Notifications() {
  const dispatch = useAppDispatch();
  const { items, unreadCount, loading, error } = useAppSelector((state) => state.notifications);
  const auth = useAppSelector((state) => state.auth.auth);
  const userId = auth?.id;
  const router = useRouter();

  const [currentPage, setCurrentPage] = useState(1);
  const notificationsPerPage = 5;
  const [displayedNotifications, setDisplayedNotifications] = useState<NotificationTarget[]>([]);

  useEffect(() => {
    if (userId) {
      dispatch(fetchUserNotifications({}));
    }
  }, [dispatch, userId]);

  useEffect(() => {
    const indexOfLastNotification = currentPage * notificationsPerPage;
    const indexOfFirstNotification = indexOfLastNotification - notificationsPerPage;
    const newNotifications = items?.slice(indexOfFirstNotification, indexOfLastNotification) || [];
    setDisplayedNotifications(newNotifications);
  }, [currentPage, items, notificationsPerPage]);

  const handleMarkAsRead = async (id: number) => {
    try {
      await dispatch(markAsRead(id)).unwrap();
    } catch (err) {
      console.error('Échec du marquage comme lu:', err);
    }
  };
  const handleNotificationClick = (notification: NotificationTarget) => {
    console.log("notification", notification);
    router.push('/demande' + notification.notificationInstance.payloadJson.redirectUrl);
    if (!notification.isRead) {
      handleMarkAsRead(notification.numero);
    }
  };

  const formatDate = (dateString: string | Date) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "À l'instant";
      const now = new Date();
      const diffInHours = Math.abs(now.getTime() - date.getTime()) / 36e5;
      if (diffInHours < 24) {
        return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
      } else {
        return date.toLocaleDateString('fr-FR', { month: 'short', day: 'numeric' });
      }
    } catch {
      return "À l'instant";
    }
  };

  const totalPages = Math.ceil((items?.length || 0) / notificationsPerPage);

  const handleNextPage = () => currentPage < totalPages && setCurrentPage((prev) => prev + 1);
  const handlePrevPage = () => currentPage > 1 && setCurrentPage((prev) => prev - 1);

  const renderItem = ({ item }: { item: NotificationTarget }) => (
    <Pressable
      style={({ pressed }) => [
        styles.notificationCard,
        pressed && styles.notificationPressed,
        !item.isRead && styles.unreadNotification,
      ]}
      onPress={() => handleNotificationClick(item)}
    >
      <View style={styles.notificationHeader}>
        <View style={styles.notificationContent}>
          {!item.isRead && <View style={styles.unreadDot} />}
          <Text style={[styles.notificationTitle, !item.isRead && styles.unreadTitle]}>
            {item.notificationInstance.payloadJson.title || 'Sans titre'}
          </Text>
        </View>
        <Text style={styles.notificationTime}>{formatDate(item.creationDate)}</Text>
      </View>
    </Pressable>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.containernotification}>
        {/* Header */}
        <View style={styles.Notificationheader}>
          <Ionicons name='notifications' size={22} color='#3657C3' />
          <Text style={styles.headerText}>Notifications</Text>
          {unreadCount > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadCount}>{unreadCount > 100 ? '99+' : unreadCount}</Text>
            </View>
          )}
        </View>

        {/* Content */}
        <View style={styles.content}>
          {loading && (
            <View style={styles.loadingContainer}>
              <Loading />
            </View>
          )}

          {error && (
            <View style={styles.center}>
              <Ionicons name='notifications-off' size={32} color='#EF4444' />
              <Text style={styles.errorText}>Échec du chargement des notifications</Text>
              <TouchableOpacity
                style={styles.retryButton}
                onPress={() => userId && dispatch(fetchUserNotifications({}))}
              >
                <Text style={styles.retryButtonText}>Réessayer</Text>
              </TouchableOpacity>
            </View>
          )}

          {!loading && !error && items?.length === 0 && (
            <View style={styles.center}>
              <Ionicons name='checkmark-circle' size={36} color='#10B981' />
              <Text style={styles.emptyTitle}>Vous êtes à jour !</Text>
              <Text style={styles.emptySubtitle}>Aucune nouvelle notification</Text>
            </View>
          )}

          {!loading && !error && items?.length > 0 && (
            <>
              <FlatList
                data={displayedNotifications}
                renderItem={renderItem}
                keyExtractor={(item) => item.numero.toString()}
                showsVerticalScrollIndicator={false}
              />

              {/* Pagination */}
              {totalPages > 1 && (
                <View style={styles.pagination}>
                  <TouchableOpacity
                    style={[
                      styles.paginationButton,
                      currentPage === 1 && styles.paginationButtonDisabled,
                    ]}
                    disabled={currentPage === 1 || loading}
                    onPress={handlePrevPage}
                  >
                    <Ionicons name='chevron-back' size={16} color='white' />
                    <Text style={styles.paginationText}>Précédent</Text>
                  </TouchableOpacity>

                  <Text style={styles.paginationInfo}>
                    Page {currentPage} sur {totalPages}
                  </Text>

                  <TouchableOpacity
                    style={[
                      styles.paginationButton,
                      currentPage === totalPages && styles.paginationButtonDisabled,
                    ]}
                    disabled={currentPage === totalPages || loading}
                    onPress={handleNextPage}
                  >
                    <Text style={styles.paginationText}>Suivant</Text>
                    <Ionicons name='chevron-forward' size={16} color='white' />
                  </TouchableOpacity>
                </View>
              )}
            </>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}
