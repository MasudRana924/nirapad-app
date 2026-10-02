import React, {useCallback, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useFocusEffect} from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import {useInbox} from '../api/queries';
import {useMarkInboxRead, useMarkAllInboxRead} from '../api/mutations';
import Header from '../components/common/Header';
import NotificationSkeleton from '../components/home/NotificationSkeleton';
import {
  parseNotificationData,
  handleNotificationClick,
  resolveInboxBookingId,
} from '../utils/notificationHandler';
import {isEmergencyData} from '../utils/bookingAlerts';
import {useTranslation} from 'react-i18next';

const byNewest = (a, b) =>
  new Date(b?.created_at || 0).getTime() - new Date(a?.created_at || 0).getTime();

const InboxScreen = ({navigation}) => {
  const {t} = useTranslation();
  const {data: notificationsData, isLoading, refetch} = useInbox({
    page: 1,
    limit: 20,
  });
  const markRead = useMarkInboxRead();
  const markAllRead = useMarkAllInboxRead();
  const notifications = Array.isArray(notificationsData?.data)
    ? [...notificationsData.data].sort(byNewest)
    : [];
  const hasUnread = notifications.some(item => !item.is_read);
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch]),
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refetch();
    } finally {
      setRefreshing(false);
    }
  }, [refetch]);

  const formatTime = dateString => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now - date;
    const diffInMins = Math.floor(diffInMs / 60000);
    const diffInHours = Math.floor(diffInMs / 3600000);
    const diffInDays = Math.floor(diffInMs / 86400000);

    if (diffInMins < 1) return t('justNow');
    if (diffInMins < 60) return `${diffInMins}m ago`;
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return date.toLocaleDateString('en-US', {month: 'short', day: 'numeric'});
  };

  const getNotificationIcon = type => {
    switch (type) {
      case 'SUGGEST_NEXT_CAREGIVER':
        return 'person-remove-outline';
      case 'SERVICE_NOT_STARTED_EMERGENCY':
        return 'warning-outline';
      case 'SERVICE_NOT_STARTED_REASON':
      case 'SERVICE_MISSED_START':
        return 'alert-circle-outline';
      case 'BOOKING':
      case 'BOOKING_CREATED':
      case 'BOOKING_ACCEPTED':
      case 'BOOKING_REASSIGNED':
      case 'BOOKING_SEARCHING':
      case 'BOOKING_REJECTED':
      case 'BOOKING_CANCELLED':
      case 'SERVICE_STARTED':
      case 'SERVICE_COMPLETED':
      case 'DISPUTE_UPDATED':
        return 'calendar-outline';
      case 'PAYMENT':
        return 'card-outline';
      case 'CAREGIVER':
        return 'person-outline';
      default:
        return 'notifications-outline';
    }
  };

  const notificationData = notification => {
    const nested = parseNotificationData(notification.data);
    const bookingId = resolveInboxBookingId(notification);
    return {
      ...nested,
      type: notification.type || nested.type,
      title: nested.title || notification.title,
      body: nested.body || notification.body,
      booking_id: nested.booking_id || bookingId || undefined,
      inbox_id: notification.id,
    };
  };

  const handleNotificationPress = notification => {
    if (notification.id && !notification.is_read) {
      markRead.mutate(notification.id);
    }
    try {
      handleNotificationClick(notificationData(notification), navigation);
    } catch (error) {
      console.error('Error handling notification press:', error);
    }
  };

  const markAllButton = (
    <TouchableOpacity
      activeOpacity={0.7}
      style={styles.markAllBtn}
      disabled={!hasUnread || markAllRead.isPending}
      onPress={() => markAllRead.mutate()}
      accessibilityLabel={t('markAllRead', 'Mark all read')}>
      <Icon
        name="checkmark-done-outline"
        size={22}
        color={hasUnread ? '#008178' : '#B7C3C1'}
      />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom', 'left', 'right']}>
      <Header
        title={t('notificationsTitle', 'Notifications')}
        showBack={true}
        rightComponent={markAllButton}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#008178']}
            tintColor="#008178"
          />
        }>
        {isLoading ? (
          <NotificationSkeleton />
        ) : notifications.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIcon}>
              <Icon name="notifications-outline" size={32} color="#008178" />
            </View>
            <Text style={styles.emptyTitle}>{t('noNotifications')}</Text>
            <Text style={styles.emptyText}>
              {t('notificationEmptyDesc')}
            </Text>
          </View>
        ) : (
          notifications.map(notification => {
            const unread = !notification.is_read;
            const emergency = isEmergencyData(notificationData(notification));
            const body = notification.body || notification.message;
            return (
              <TouchableOpacity
                key={notification.id}
                style={[
                  styles.card,
                  unread && styles.cardUnread,
                  emergency && styles.cardEmergency,
                ]}
                onPress={() => handleNotificationPress(notification)}>
                <View
                  style={[
                    styles.iconWrap,
                    !unread && !emergency && styles.iconWrapRead,
                  ]}>
                  <Icon
                    name={getNotificationIcon(notification.type)}
                    size={20}
                    color={emergency ? '#DC2626' : '#008178'}
                  />
                </View>

                <View style={styles.content}>
                  <View style={styles.topRow}>
                    <View style={styles.textCol}>
                      {notification.title ? (
                        <Text
                          style={[
                            styles.title,
                            emergency && styles.titleEmergency,
                          ]}
                          numberOfLines={1}>
                          {notification.title}
                        </Text>
                      ) : null}
                      {body ? (
                        <Text
                          style={[
                            styles.message,
                            unread && styles.messageUnread,
                          ]}
                          numberOfLines={3}>
                          {body}
                        </Text>
                      ) : null}
                    </View>
                    {unread && <View style={styles.unreadDot} />}
                  </View>
                  <Text style={styles.time}>
                    {formatTime(notification.created_at)}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default InboxScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    paddingHorizontal: 24,
  },
  emptyIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#E6F4F3',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111820',
  },
  emptyText: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 20,
    color: '#8190A7',
    textAlign: 'center',
  },
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E6ECEB',
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
  },
  cardUnread: {
    backgroundColor: '#E6F4F3',
    borderColor: '#E6F4F3',
  },
  cardEmergency: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
  },
  markAllBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textCol: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111820',
    marginBottom: 2,
  },
  titleEmergency: {
    color: '#B91C1C',
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  iconWrapRead: {
    backgroundColor: '#E8F6F2',
  },
  content: {
    flex: 1,
    minWidth: 0,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  message: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    color: '#303944',
    fontWeight: '400',
  },
  messageUnread: {
    color: '#111820',
    fontWeight: '600',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#008178',
    marginLeft: 8,
    marginTop: 6,
  },
  time: {
    marginTop: 8,
    fontSize: 12,
    color: '#8190A7',
  },
});
