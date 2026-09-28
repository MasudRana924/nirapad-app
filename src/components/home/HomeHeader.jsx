import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity, Image} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {useAuth} from '../../context/AuthContext';
import {useInbox, useInboxUnreadCount, useSupportUnreadCount} from '../../api/queries';
import {useTranslation} from 'react-i18next';

const INK = '#0B3F3C';

const getGreeting = (t) => {
  const hour = new Date().getHours();
  if (hour < 12) return t('goodMorning');
  if (hour < 17) return t('goodAfternoon');
  return t('goodEvening');
};

const HomeHeader = ({navigation}) => {
  const {t} = useTranslation();
  const {user} = useAuth();
  const {data: inboxData} = useInbox({page: 1, limit: 1});
  const {data: unreadCount} = useInboxUnreadCount();
  const {count: supportUnread} = useSupportUnreadCount();
  const unread = inboxData?.meta?.unread ?? unreadCount ?? 0;
  
  const greeting = getGreeting(t);
  const displayName =
    user?.name || user?.full_name || user?.first_name || t('there');
  const photo = user?.photo || user?.profile_photo || user?.avatar;

  return (
    <View style={styles.header}>
      <View style={styles.headerLeft}>
        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.profileButton}
          onPress={() => navigation?.navigate('Profile')}>
          {photo ? (
            <Image source={{uri: photo}} style={styles.profileImage} />
          ) : (
            <View style={styles.placeholderAvatar}>
              <Icon name="person" size={20} color="#9AA8A5" />
            </View>
          )}
        </TouchableOpacity>

        <View style={styles.greetingBlock}>
          <Text style={styles.goodMorning}>{greeting}</Text>
          <Text style={styles.userName} numberOfLines={1}>
            {displayName}
          </Text>
        </View>
      </View>

      <View style={styles.headerRight}>
        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.iconButton}
          onPress={() => navigation?.navigate('SupportChat')}>
          <Icon name="chatbubble-ellipses-outline" size={22} color={INK} />
          {Number(supportUnread) > 0 ? (
            <View style={styles.countBadge}>
              <Text style={styles.countBadgeText}>
                {supportUnread > 9 ? '9+' : supportUnread}
              </Text>
            </View>
          ) : null}
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.iconButton}
          onPress={() => navigation?.navigate('Inbox')}>
          <Icon name="notifications-outline" size={22} color={INK} />
          {Number(unread) > 0 ? <View style={styles.notificationDot} /> : null}
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default HomeHeader;

const styles = StyleSheet.create({
  header: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 6,
    marginBottom: 2,
  },
  headerLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  profileButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: 'hidden',
    backgroundColor: '#EEF2F1',
    marginRight: 14,
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
  placeholderAvatar: {
    width: '100%',
    height: '100%',
    backgroundColor: '#EEF2F1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  greetingBlock: {
    flex: 1,
    justifyContent: 'center',
  },
  goodMorning: {
    fontSize: 13,
    lineHeight: 17,
    color: '#5F6F6C',
    fontWeight: '400',
  },
  userName: {
    fontSize: 20,
    lineHeight: 25,
    color: '#0F1A19',
    fontWeight: '700',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#E8F2F0',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
  },
  countBadge: {
    position: 'absolute',
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#E34242',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
    right: 2,
    top: 2,
    borderWidth: 1.5,
    borderColor: '#E8F2F0',
  },
  countBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '700',
  },
  notificationDot: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E34242',
    borderWidth: 1.5,
    borderColor: '#E8F2F0',
    right: 11,
    top: 10,
  },
});
