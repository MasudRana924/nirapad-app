import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import {useAuth} from '../context/AuthContext';
import {useUserProfile, useSupportUnreadCount} from '../api/queries';
import Toast from '../components/common/Toast';
import {storage} from '../utils/storage';
import {useAppModal} from '../contexts/ModalContext';
import {useTranslation} from 'react-i18next';
import LanguageSwitch from '../components/common/LanguageSwitch';

const PRIMARY = '#008178';
const TEXT = '#10302D';
const MUTED = '#6B7F7C';

const ProfileScreen = ({navigation}) => {
  const {t} = useTranslation();
  const {logout} = useAuth();
  const {showConfirm} = useAppModal();
  const {data: profileData, isLoading} = useUserProfile();
  const {count: supportUnread} = useSupportUnreadCount();
  const [toast, setToast] = useState({
    visible: false,
    message: '',
    type: 'success',
  });

  const user = profileData?.data || {};
  const contact = user.email || user.phone || '';

  const handleUpdateDetails = () => {
    navigation?.navigate('EditProfile');
  };

  const handleLogout = () => {
    showConfirm({
      title: t('logout'),
      message: t('logoutConfirm'),
      confirmText: t('logout'),
      cancelText: t('cancel'),
      confirmDestructive: true,
      onConfirm: async () => {
        await storage.clearBookingData();
        logout();
      },
    });
  };

  const menuItems = [
    {
      id: 'edit',
      name: t('editProfile'),
      subtitle: t('namePhotoContact'),
      icon: 'person-outline',
      onPress: handleUpdateDetails,
    },
    {
      id: 'privacy',
      name: t('privacySecurity'),
      subtitle: t('accountProtection'),
      icon: 'shield-checkmark-outline',
    },
    {
      id: 'settings',
      name: t('notifications'),
      subtitle: t('muteAlerts'),
      icon: 'notifications-outline',
      onPress: () => navigation?.navigate('NotificationSettings'),
    },
    // {
    //   id: 'support',
    //   name: t('supportChat'),
    //   subtitle: t('supportChatSubtitle'),
    //   icon: 'chatbubbles-outline',
    //   badgeCount: supportUnread,
    //   onPress: () => navigation?.navigate('SupportChat'),
    // },
  ];

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text style={styles.headerTitle}>{t('myAccount')}</Text>
          {/* <Text style={styles.headerSubtitle}>
            {t('manageProfileSettings')}
          </Text> */}
        </View>
        <LanguageSwitch />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={handleUpdateDetails}
          style={styles.profileCardWrap}>
          <LinearGradient
            colors={['#FFFFFF', '#FFFFFF']}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 1}}
            style={styles.profileCard}>
            <View style={styles.leafLarge} />
            <View style={styles.leafSmall} />

            <View style={styles.avatarRing}>
              {user.profile_photo ? (
                <Image
                  source={{uri: user.profile_photo}}
                  style={styles.avatarImage}
                />
              ) : (
                <View style={styles.avatar}>
                  <Icon name="person-outline" size={30} color={PRIMARY} />
                </View>
              )}
              <View style={styles.cameraBadge}>
                <Icon name="camera" size={12} color="#FFFFFF" />
              </View>
            </View>

            <View style={styles.profileInfo}>
              <Text style={styles.profileName} numberOfLines={1}>
                {isLoading ? t('loading') : user.name || t('yourProfile')}
              </Text>
              {!!contact && (
                <Text style={styles.profileEmail} numberOfLines={1}>
                  {contact}
                </Text>
              )}
            </View>

            <Icon name="chevron-forward" size={20} color={MUTED} />
          </LinearGradient>
        </TouchableOpacity>

        <Text style={styles.sectionTitle}>{t('account')}</Text>

        {menuItems.map(item => (
          <TouchableOpacity
            key={item.id}
            activeOpacity={0.75}
            style={styles.menuItem}
            onPress={item.onPress}>
            <View style={styles.menuIconBg}>
              <Icon name={item.icon} size={22} color={PRIMARY} />
            </View>
            <View style={styles.menuTextBlock}>
              <Text style={styles.menuText}>{item.name}</Text>
              {!!item.subtitle && (
                <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
              )}
            </View>
            {item.badgeCount > 0 ? (
              <View style={styles.menuBadge}>
                <Text style={styles.menuBadgeText}>
                  {item.badgeCount > 99 ? '99+' : item.badgeCount}
                </Text>
              </View>
            ) : null}
            <Icon name="chevron-forward" size={18} color={MUTED} />
          </TouchableOpacity>
        ))}

        <View style={styles.versionRow}>
          <View style={styles.versionLine} />
          <Text style={styles.versionText}>{t('appVersion')}</Text>
          <View style={styles.versionLine} />
        </View>

        <TouchableOpacity
          activeOpacity={0.85}
          style={styles.logoutButton}
          onPress={handleLogout}>
          <Icon name="log-out-outline" size={22} color="#E5484D" />
          <Text style={styles.logoutText}>{t('logOut')}</Text>
        </TouchableOpacity>
      </ScrollView>

      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onHide={() => setToast({...toast, visible: false})}
      />
    </SafeAreaView>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 16,
  },

  headerText: {
    flex: 1,
    marginRight: 12,
  },

  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: TEXT,
    letterSpacing: -0.4,
  },

  headerSubtitle: {
    fontSize: 13,
    color: MUTED,
    marginTop: 2,
  },

  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 28,
  },

  profileCardWrap: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E6ECEB',
    overflow: 'hidden',
    marginBottom: 24,
  },

  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },

  leafLarge: {
    position: 'absolute',
    right: -30,
    bottom: -40,
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: 'rgba(0, 129, 120, 0.06)',
  },

  leafSmall: {
    position: 'absolute',
    right: 30,
    bottom: -30,
    width: 70,
    height: 70,
    borderTopLeftRadius: 70,
    borderBottomRightRadius: 70,
    backgroundColor: 'rgba(0, 129, 120, 0.05)',
    transform: [{rotate: '-20deg'}],
  },

  avatarRing: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#FFFFFF',
    borderWidth: 4,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#E6F4F1',
    alignItems: 'center',
    justifyContent: 'center',
  },

  avatarImage: {
    width: 64,
    height: 64,
    borderRadius: 32,
  },

  cameraBadge: {
    position: 'absolute',
    right: -4,
    bottom: -2,
    width: 24,
    height: 24,
    borderRadius: 7,
    backgroundColor: PRIMARY,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  profileInfo: {
    flex: 1,
    marginLeft: 14,
    marginRight: 8,
  },

  profileName: {
    fontSize: 20,
    fontWeight: '700',
    color: TEXT,
  },

  profileEmail: {
    fontSize: 13,
    color: MUTED,
    marginTop: 3,
  },

  sectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: MUTED,
    marginBottom: 12,
  },

  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E6ECEB',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 12,
  },

  menuIconBg: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#E6F4F1',
    alignItems: 'center',
    justifyContent: 'center',
  },

  menuTextBlock: {
    flex: 1,
    marginLeft: 14,
    marginRight: 8,
  },

  menuText: {
    fontSize: 15.5,
    fontWeight: '600',
    color: TEXT,
  },

  menuSubtitle: {
    fontSize: 12.5,
    color: MUTED,
    marginTop: 3,
  },

  menuBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#E34242',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
    marginRight: 8,
  },

  menuBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  versionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 16,
    paddingHorizontal: 4,
  },

  versionLine: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#D5DEDC',
  },

  versionText: {
    fontSize: 12,
    color: MUTED,
    marginHorizontal: 14,
  },

  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 50,
    borderRadius: 12,
    backgroundColor: '#FDEEEE',
    borderWidth: 1,
    borderColor: '#FDEEEE',
    gap: 10,
  },

  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#E5484D',
  },
});
