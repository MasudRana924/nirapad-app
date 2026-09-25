import React, {useState, useEffect} from 'react';
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
import {useAuth} from '../context/AuthContext';
import {useUserProfile} from '../api/queries';
import Toast from '../components/common/Toast';
import {storage} from '../utils/storage';
import {useAppModal} from '../contexts/ModalContext';
import {useTranslation} from 'react-i18next';
import LanguageSwitch from '../components/common/LanguageSwitch';

const ProfileScreen = ({navigation}) => {
  const {t} = useTranslation();
  const {logout} = useAuth();
  const {showConfirm} = useAppModal();
  const {data: profileData, isLoading} = useUserProfile();
  const [toast, setToast] = useState({
    visible: false,
    message: '',
    type: 'success',
  });

  const user = profileData?.data || {};

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

  const getInitials = name => {
    if (!name) {
      return 'U';
    }
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
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
      id: 'family',
      name: t('familyMembers'),
      subtitle: t('manageYourFamily'),
      icon: 'people-outline',
      onPress: () => navigation?.navigate('Family'),
    },
    {
      id: 'bookings',
      name: t('myBookings'),
      subtitle: t('historyUpcoming'),
      icon: 'calendar-outline',
      onPress: () => navigation?.navigate('Bookings'),
    },
    {
      id: 'privacy',
      name: t('privacySecurity'),
      subtitle: t('accountProtection'),
      icon: 'lock-closed-outline',
    },
    {
      id: 'settings',
      name: t('notifications'),
      subtitle: t('muteAlerts'),
      icon: 'notifications-outline',
      onPress: () => navigation?.navigate('NotificationSettings'),
    },
  ];

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('myAccount')}</Text>
        <LanguageSwitch />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        <View style={styles.profileCard}>
          {user.profile_photo ? (
            <Image
              source={{uri: user.profile_photo}}
              style={styles.avatarImage}
            />
          ) : (
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{getInitials(user.name)}</Text>
            </View>
          )}

          <View style={styles.profileInfo}>
            <Text style={styles.profileName} numberOfLines={1}>
              {isLoading ? t('loading') : user.name || t('yourProfile')}
            </Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>{t('account')}</Text>
        <View style={styles.menuContainer}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={item.id}
              activeOpacity={0.75}
              style={[
                styles.menuItem,
                index === menuItems.length - 1 && styles.menuItemLast,
              ]}
              onPress={item.onPress}>
              <View style={styles.menuIconBg}>
                <Icon name={item.icon} size={20} color="#008178" />
              </View>
              <View style={styles.menuTextBlock}>
                <Text style={styles.menuText}>{item.name}</Text>
                {!!item.subtitle && (
                  <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
                )}
              </View>
              <Icon name="chevron-forward" size={18} color="#8190A7" />
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.versionRow}>
          <Text style={styles.versionText}>{t('appVersion')}</Text>
        </View>

        <TouchableOpacity
          activeOpacity={0.85}
          style={styles.logoutButton}
          onPress={handleLogout}>
          <Icon name="log-out-outline" size={20} color="#E74C3C" />
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
    paddingTop: 8,
    paddingBottom: 14,
  },

  headerTitle: {
    fontSize: 15,
    fontWeight: '500',
    color: '#111820',
    letterSpacing: -0.3,
  },

  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 28,
  },

  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F6F6F6',
    borderRadius: 18,
    padding: 14,
    marginBottom: 22,
  },

  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#008178',
    alignItems: 'center',
    justifyContent: 'center',
  },

  avatarImage: {
    width: 52,
    height: 52,
    borderRadius: 26,
  },

  avatarText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  profileInfo: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
  },

  profileName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111820',
  },

  editIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#E6F4F3',
    alignItems: 'center',
    justifyContent: 'center',
  },

  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#8190A7',
    marginBottom: 10,
    marginLeft: 4,
  },

  menuContainer: {
    backgroundColor: '#F6F6F6',
    borderRadius: 18,
    overflow: 'hidden',
  },

  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#EAEAEA',
  },

  menuItemLast: {
    borderBottomWidth: 0,
  },

  menuIconBg: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#E6F4F3',
    alignItems: 'center',
    justifyContent: 'center',
  },

  menuTextBlock: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
  },

  menuText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111820',
  },

  menuSubtitle: {
    fontSize: 12,
    color: '#8190A7',
    marginTop: 2,
  },

  versionRow: {
    alignItems: 'center',
    marginTop: 20,
  },

  versionText: {
    fontSize: 12,
    color: '#8190A7',
  },

  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 14,
    height: 52,
    borderRadius: 14,
    backgroundColor: '#FDF2F2',
    borderWidth: 1,
    borderColor: '#FCDEDE',
    gap: 8,
  },

  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#E74C3C',
  },
});
