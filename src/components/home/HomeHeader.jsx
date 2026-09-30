import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity, Image} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import {useAuth} from '../../context/AuthContext';
import {useInbox, useInboxUnreadCount} from '../../api/queries';
import {useTranslation} from 'react-i18next';

const logo = require('../../assets/logo-mark.png');

const TEAL = '#0B6E65';
const INK = '#172824';

const HomeHeader = ({navigation}) => {
  const {t} = useTranslation();
  const insets = useSafeAreaInsets();
  const {user} = useAuth();
  const {data: inboxData} = useInbox({page: 1, limit: 1});
  const {data: unreadCount} = useInboxUnreadCount();
  const unread = inboxData?.meta?.unread ?? unreadCount ?? 0;
  const photo = user?.photo || user?.profile_photo || user?.avatar;

  return (
    <View style={[styles.header, {paddingTop: insets.top + 10}]}>
      <View style={styles.brand}>
        <Image source={logo} style={styles.logoMark} resizeMode="contain" />
        <View style={styles.brandCopy}>
          <Text style={styles.brandName}>Nirapod</Text>
          <Text style={styles.tagline} numberOfLines={1}>
            {t('careTodayPeace')}
          </Text>
        </View>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.bellButton}
          onPress={() => navigation?.navigate('Inbox')}>
          <Icon name="notifications-outline" size={20} color={INK} />
          {Number(unread) > 0 ? <View style={styles.bellDot} /> : null}
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.85}
          style={styles.profile}
          onPress={() => navigation?.navigate('Profile')}>
          <View style={styles.avatarButton}>
            {photo ? (
              <Image source={{uri: photo}} style={styles.avatarImage} />
            ) : (
              <View style={styles.avatarFallback}>
                <Icon name="person" size={18} color={TEAL} />
              </View>
            )}
          </View>
          <Icon name="chevron-down" size={16} color={INK} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default HomeHeader;

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingBottom: 12,
  },
  brand: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  logoMark: {
    width: 46,
    height: 40,
    tintColor: TEAL,
  },
  brandCopy: {
    flex: 1,
    marginLeft: 8,
  },
  brandName: {
    color: TEAL,
    fontSize: 24,
    lineHeight: 28,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  tagline: {
    color: '#6E7E7A',
    fontSize: 10.5,
    lineHeight: 14,
    fontWeight: '500',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bellButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E6ECEB',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  bellDot: {
    position: 'absolute',
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: '#FF5A5F',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    top: 7,
    right: 8,
  },
  profile: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  avatarButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E6ECEB',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarFallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E7F6F2',
  },
});
