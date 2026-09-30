import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity, Image} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import {useAuth} from '../../context/AuthContext';
import {useInbox, useInboxUnreadCount} from '../../api/queries';
import {useTranslation} from 'react-i18next';

const logo = require('../../assets/logo-mark.png');

const HomeHeader = ({navigation}) => {
  const {t} = useTranslation();
  const insets = useSafeAreaInsets();
  const {user} = useAuth();
  const {data: inboxData} = useInbox({page: 1, limit: 1});
  const {data: unreadCount} = useInboxUnreadCount();
  const unread = inboxData?.meta?.unread ?? unreadCount ?? 0;
  const photo = user?.photo || user?.profile_photo || user?.avatar;

  return (
    <LinearGradient
      colors={['#14A08C', '#0E8B78', '#0C7C6C']}
      start={{x: 0, y: 0}}
      end={{x: 1, y: 1}}
      style={[styles.header, {paddingTop: insets.top + 8}]}>
      <View style={styles.blobTop} />
      <View style={styles.blobSide} />

      <View style={styles.row}>
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
            <Icon name="notifications-outline" size={20} color="#FFFFFF" />
            {Number(unread) > 0 ? <View style={styles.bellDot} /> : null}
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.85}
            style={styles.avatarButton}
            onPress={() => navigation?.navigate('Profile')}>
            {photo ? (
              <Image source={{uri: photo}} style={styles.avatarImage} />
            ) : (
              <View style={styles.avatarFallback}>
                <Icon name="person" size={18} color="#0E8B78" />
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </LinearGradient>
  );
};

export default HomeHeader;

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 16,
    paddingBottom: 20,
    overflow: 'hidden',
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  blobTop: {
    position: 'absolute',
    width: 210,
    height: 210,
    borderRadius: 105,
    backgroundColor: 'rgba(255,255,255,0.08)',
    top: -90,
    right: -50,
  },
  blobSide: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(8,70,62,0.12)',
    left: -60,
    bottom: -40,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brand: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  logoMark: {
    width: 42,
    height: 42,
  },
  brandCopy: {
    flex: 1,
    marginLeft: 10,
  },
  brandName: {
    color: '#FFFFFF',
    fontSize: 22,
    lineHeight: 26,
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  tagline: {
    marginTop: 1,
    color: 'rgba(255,255,255,0.88)',
    fontSize: 11,
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
    backgroundColor: 'rgba(255,255,255,0.16)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  bellDot: {
    position: 'absolute',
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: '#FF4B4B',
    borderWidth: 1.5,
    borderColor: '#149684',
    top: 8,
    right: 8,
  },
  avatarButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.85)',
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
