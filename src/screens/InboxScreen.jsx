import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import {useNotifications} from '../api/queries';
import Header from '../components/common/Header';
import NotificationSkeleton from '../components/home/NotificationSkeleton';

const InboxScreen = ({navigation}) => {
  const {data: notificationsData, isLoading} = useNotifications({page: 1, limit: 20});
  const notifications = notificationsData?.data?.notifications || [];
  const unreadCount = notificationsData?.data?.unreadCount || 0;

  const formatTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now - date;
    const diffInMins = Math.floor(diffInMs / 60000);
    const diffInHours = Math.floor(diffInMs / 3600000);
    const diffInDays = Math.floor(diffInMs / 86400000);

    if (diffInMins < 1) return 'Just now';
    if (diffInMins < 60) return `${diffInMins}m ago`;
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return date.toLocaleDateString('en-US', {month: 'short', day: 'numeric'});
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'BOOKING':
        return 'calendar-outline';
      case 'PAYMENT':
        return 'card-outline';
      case 'CAREGIVER':
        return 'person-outline';
      default:
        return 'notifications-outline';
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'BOOKING':
        return '#008178';
      case 'PAYMENT':
        return '#F59E0B';
      case 'CAREGIVER':
        return '#3B82F6';
      default:
        return '#6B7280';
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom', 'left', 'right']}>
      <Header title="Inbox" />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {isLoading ? (
          <NotificationSkeleton />
        ) : notifications.length === 0 ? (
          <View style={styles.emptyState}>
            <Icon name="mail-outline" size={64} color="#E3E8F0" />
            <Text style={styles.emptyTitle}>No Notifications</Text>
            <Text style={styles.emptyText}>
              You don't have any notifications yet
            </Text>
          </View>
        ) : (
          notifications.map(notification => (
            <View
              key={notification.id}
              style={[
                styles.notificationCard,
                !notification.is_read && styles.unreadCard,
              ]}>
              <View style={styles.cardHeader}>
                <View
                  style={[
                    styles.iconContainer,
                    {backgroundColor: getNotificationColor(notification.type) + '15'},
                  ]}>
                  <Icon
                    name={getNotificationIcon(notification.type)}
                    size={20}
                    color={getNotificationColor(notification.type)}
                  />
                </View>
                <View style={styles.headerContent}>
                    <Text style={styles.message}>{notification.message}</Text>
                </View>
                {!notification.is_read && <View style={styles.unreadDot} />}
              </View>
            
              <Text style={styles.time}>{formatTime(notification.created_at)}</Text>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#172333',
    marginTop: 16,
  },
  emptyText: {
    fontSize: 14,
    color: '#8190A7',
    marginTop: 8,
  },
  notificationCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E3E8F0',
  },
  unreadCard: {
    backgroundColor: '#F0F9FF',
    borderColor: '#008178',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  headerContent: {
    flex: 1,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: '#172333',
    marginBottom: 4,
  },
  unreadTitle: {
    fontWeight: '700',
  },
  time: {
    fontSize: 12,
    color: '#8190A7',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#008178',
  },
  message: {
    fontSize: 12,
    color: '#172333',
    lineHeight: 20,
    marginBottom: 12,
  },
  typeBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
  },
  typeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#8190A7',
    textTransform: 'uppercase',
  },
});

export default InboxScreen;
