import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity, Image} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {useAuth} from '../../context/AuthContext';
import {useInbox, useInboxUnreadCount, useConversationUnreadCount} from '../../api/queries';

const INK = '#0B3F3C';
const MUTED = '#8A9A97';

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
};

const HomeHeader = ({navigation}) => {
  const {user} = useAuth();
  const {data: inboxData} = useInbox({page: 1, limit: 1});
  const {data: unreadCount} = useInboxUnreadCount();
  const {data: conversationUnreadCount} = useConversationUnreadCount();
  const unread = inboxData?.meta?.unread ?? unreadCount ?? 0;
  const conversationUnread = conversationUnreadCount ?? 0;
  const greeting = getGreeting();
  const displayName =
    user?.name || user?.full_name || user?.first_name || 'there';
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
          onPress={() => navigation?.navigate('ConversationList')}>
          <Icon name="chatbubbles-outline" size={22} color={INK} />
          {Number(conversationUnread) > 0 ? (
            <View style={styles.notificationDot} />
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
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
    marginBottom: 4,
  },
  headerLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  profileButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: '#EEF2F1',
    marginRight: 12,
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
    fontSize: 10,
    lineHeight: 18,
    color: MUTED,
    fontWeight: '400',
  },
  userName: {
    fontSize: 16,
    lineHeight: 20,
    color: INK,
    fontWeight: '600',
    marginTop: 1,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0F3F2',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  notificationDot: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E34242',
    borderWidth: 1.5,
    borderColor: '#F0F3F2',
    right: 11,
    top: 11,
  },
});
