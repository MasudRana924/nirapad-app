import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  useWindowDimensions,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import {useAuth} from '../../context/AuthContext';
import {useInbox, useInboxUnreadCount} from '../../api/queries';
import {useTranslation} from 'react-i18next';

const logo = require('../../assets/logo-mark.png');

const PAGE = '#F4F7F6';
const WAVE_SCALE_Y = 0.1;

const HomeHeader = ({navigation}) => {
  const {t} = useTranslation();
  const insets = useSafeAreaInsets();
  const {width} = useWindowDimensions();
  const {user} = useAuth();
  const {data: inboxData} = useInbox({page: 1, limit: 1});
  const {data: unreadCount} = useInboxUnreadCount();
  const unread = inboxData?.meta?.unread ?? unreadCount ?? 0;
  const photo = user?.photo || user?.profile_photo || user?.avatar;

  const waveSize = width * 2.2;
  const waveVisibleTop = 26;

  return (
    <LinearGradient
      colors={['#0A5A53', '#0C6E65', '#0F8174']}
      start={{x: 0, y: 0.2}}
      end={{x: 1, y: 0.8}}
      style={[styles.header, {paddingTop: insets.top + 10}]}>
      <View style={styles.glowRight} />
      <View style={styles.glowLeft} />

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
            style={styles.profile}
            onPress={() => navigation?.navigate('Profile')}>
            <View style={styles.avatarButton}>
              {photo ? (
                <Image source={{uri: photo}} style={styles.avatarImage} />
              ) : (
                <View style={styles.avatarFallback}>
                  <Icon name="person" size={18} color="#0E8B78" />
                </View>
              )}
            </View>
            <Icon name="chevron-down" size={16} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>

      <View
        pointerEvents="none"
        style={[
          styles.wave,
          {
            width: waveSize,
            height: waveSize,
            borderRadius: waveSize / 2,
            left: width * 0.28 - waveSize / 2,
            bottom:
              waveVisibleTop - waveSize / 2 - (waveSize * WAVE_SCALE_Y) / 2,
            transform: [{scaleY: WAVE_SCALE_Y}],
          },
        ]}
      />
    </LinearGradient>
  );
};

export default HomeHeader;

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 18,
    paddingBottom: 40,
    overflow: 'hidden',
  },
  glowRight: {
    position: 'absolute',
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: 'rgba(255,255,255,0.06)',
    top: -110,
    right: -60,
  },
  glowLeft: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(255,255,255,0.04)',
    top: -40,
    left: -80,
  },
  wave: {
    position: 'absolute',
    backgroundColor: PAGE,
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
    width: 46,
    height: 40,
  },
  brandCopy: {
    flex: 1,
    marginLeft: 8,
  },
  brandName: {
    color: '#FFFFFF',
    fontSize: 24,
    lineHeight: 28,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  tagline: {
    color: 'rgba(255,255,255,0.85)',
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
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
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
    borderColor: '#0C6E65',
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
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#FFFFFF',
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
