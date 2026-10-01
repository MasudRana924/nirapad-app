import React, {useCallback, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Modal,
  Pressable,
  Platform,
  RefreshControl,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useFocusEffect} from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';
import {useAuth} from '../context/AuthContext';
import {useMyAccount, useSupportUnreadCount} from '../api/queries';
import {useRefreshMyAccount, useUpdateMyPhoto} from '../api/mutations';
import {getApiErrorMessage} from '../api/client';
import {storage} from '../utils/storage';
import {useAppModal} from '../contexts/ModalContext';
import {useTranslation} from 'react-i18next';
import LanguageSwitch from '../components/common/LanguageSwitch';
import {requestCameraPermission, requestGalleryPermission} from '../utils/permissions';
import {
  GENDER_LABEL_KEYS,
  PHOTO_PICKER_OPTIONS,
  formatDateOfBirth,
  photoFromAsset,
  validatePhoto,
} from '../utils/account';

const PRIMARY = '#008178';
const TEXT = '#10302D';
const MUTED = '#6B7F7C';

const ProfileScreen = ({navigation}) => {
  const {t} = useTranslation();
  const {logout, user: cachedUser} = useAuth();
  const {showConfirm, showModal} = useAppModal();
  const {data: accountData, isLoading} = useMyAccount();
  const refreshAccount = useRefreshMyAccount();
  const updatePhoto = useUpdateMyPhoto();
  const {count: supportUnread} = useSupportUnreadCount();
  const [refreshing, setRefreshing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);

  const user = accountData?.data || cachedUser || {};

  const notify = (message, type = 'success') => {
    showModal({
      type,
      title: type === 'success' ? t('success') : t('error'),
      message,
    });
  };

  useFocusEffect(
    useCallback(() => {
      refreshAccount().catch(error => {
        console.log('Failed to load account:', error?.message);
      });
    }, [refreshAccount]),
  );

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshAccount();
    } catch (error) {
      notify(getApiErrorMessage(error, t('failedToLoadProfile')), 'error');
    } finally {
      setRefreshing(false);
    }
  };

  const uploadPhoto = async photo => {
    setUploading(true);
    try {
      const form = new FormData();
      form.append('photo', {uri: photo.uri, name: photo.name, type: photo.type});
      await updatePhoto.mutateAsync(form);
      await refreshAccount();
      notify(t('profilePhotoUpdated'));
    } catch (error) {
      notify(getApiErrorMessage(error, t('failedToUpdatePhoto')), 'error');
    } finally {
      setUploading(false);
    }
  };

  const pickPhoto = source => {
    setSheetOpen(false);
    setTimeout(
      async () => {
        try {
          const granted =
            source === 'camera'
              ? await requestCameraPermission()
              : await requestGalleryPermission();
          if (!granted) {
            notify(
              source === 'camera' ? t('cameraPermission') : t('galleryPermission'),
              'error',
            );
            return;
          }
          const launcher = source === 'camera' ? launchCamera : launchImageLibrary;
          const result = await launcher(
            source === 'camera'
              ? {...PHOTO_PICKER_OPTIONS, saveToPhotos: false}
              : PHOTO_PICKER_OPTIONS,
          );
          if (result.didCancel) {
            return;
          }
          if (result.errorCode) {
            notify(result.errorMessage || t('failedToOpenImagePicker'), 'error');
            return;
          }
          const asset = result.assets?.[0];
          if (!asset?.uri) {
            return;
          }
          const photo = photoFromAsset(asset);
          const errorKey = validatePhoto(photo);
          if (errorKey) {
            notify(t(errorKey), 'error');
            return;
          }
          uploadPhoto(photo);
        } catch (error) {
          console.error('Photo picker error:', error);
          notify(t('failedToOpenImagePicker'), 'error');
        }
      },
      Platform.OS === 'ios' ? 350 : 80,
    );
  };

  const handleEditProfile = () => {
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

  const genderLabel = GENDER_LABEL_KEYS[user.gender]
    ? t(GENDER_LABEL_KEYS[user.gender])
    : null;
  const detailRows = [
    {id: 'phone', icon: 'call-outline', label: t('phone'), value: user.phone},
    {id: 'email', icon: 'mail-outline', label: t('email'), value: user.email},
    {id: 'gender', icon: 'male-female-outline', label: t('gender'), value: genderLabel},
    {
      id: 'dob',
      icon: 'calendar-outline',
      label: t('dateOfBirth'),
      value: formatDateOfBirth(user.date_of_birth),
    },
    {id: 'address', icon: 'location-outline', label: t('address'), value: user.address},
  ];

  const menuItems = [
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
        </View>
        <LanguageSwitch />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[PRIMARY]}
            tintColor={PRIMARY}
          />
        }>
        <View style={styles.profileCard}>
          <View style={styles.leafLarge} />
          <View style={styles.leafSmall} />

          <View style={styles.avatarRing}>
            {user.profile_photo ? (
              <Image source={{uri: user.profile_photo}} style={styles.avatarImage} />
            ) : (
              <View style={styles.avatar}>
                <Icon name="person-outline" size={34} color={PRIMARY} />
              </View>
            )}
            {uploading ? (
              <View style={styles.avatarOverlay}>
                <ActivityIndicator color="#FFFFFF" />
              </View>
            ) : null}
            <TouchableOpacity
              activeOpacity={0.8}
              disabled={uploading}
              onPress={() => setSheetOpen(true)}
              hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}
              style={[styles.cameraBadge, uploading && styles.cameraBadgeDisabled]}>
              <Icon name="camera" size={14} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          <View style={styles.profileInfo}>
            <Text style={styles.profileName} numberOfLines={1}>
              {isLoading && !user.name ? t('loading') : user.name || t('yourProfile')}
            </Text>
            {!!(user.phone || user.email) && (
              <Text style={styles.profileContact} numberOfLines={1}>
                {user.phone || user.email}
              </Text>
            )}
          </View>

          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.editButton}
            onPress={handleEditProfile}
            accessibilityLabel={t('editProfile')}
            hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}>
            <Icon name="create-outline" size={20} color={PRIMARY} />
          </TouchableOpacity>
        </View>

        <View style={styles.detailsCard}>
          {detailRows.map((row, index) => (
            <View
              key={row.id}
              style={[styles.detailRow, index > 0 && styles.detailRowBorder]}>
              <Icon name={row.icon} size={18} color={PRIMARY} />
              <View style={styles.detailText}>
                <Text style={styles.detailLabel}>{row.label}</Text>
                <Text
                  style={[styles.detailValue, !row.value && styles.detailEmpty]}
                  numberOfLines={3}>
                  {row.value || t('notSet')}
                </Text>
              </View>
            </View>
          ))}
        </View>

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

      <Modal
        visible={sheetOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setSheetOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setSheetOpen(false)}>
          <View style={styles.sheet} onStartShouldSetResponder={() => true}>
            <SheetAction
              icon="camera-outline"
              label={t('takePhoto')}
              onPress={() => pickPhoto('camera')}
            />
            <SheetAction
              icon="image-outline"
              label={t('chooseFromGallery')}
              onPress={() => pickPhoto('gallery')}
            />
            <SheetAction
              icon="close-outline"
              label={t('cancel')}
              onPress={() => setSheetOpen(false)}
            />
          </View>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
};

const SheetAction = ({icon, label, onPress}) => (
  <TouchableOpacity style={styles.sheetAction} onPress={onPress}>
    <Icon name={icon} size={22} color={PRIMARY} />
    <Text style={styles.sheetLabel}>{label}</Text>
  </TouchableOpacity>
);

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
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 110,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E6ECEB',
    overflow: 'hidden',
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
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
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#E6F4F1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarImage: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#E6F4F1',
  },
  avatarOverlay: {
    position: 'absolute',
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraBadge: {
    position: 'absolute',
    right: -2,
    bottom: -2,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: PRIMARY,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraBadgeDisabled: {
    opacity: 0.5,
  },
  profileInfo: {
    flex: 1,
    marginLeft: 14,
    marginRight: 10,
  },
  profileName: {
    fontSize: 18,
    fontWeight: '700',
    color: TEXT,
  },
  profileContact: {
    fontSize: 13,
    color: MUTED,
    marginTop: 3,
  },
  editButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E6F4F1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailsCard: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E6ECEB',
    paddingHorizontal: 14,
    marginBottom: 24,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 12,
    gap: 12,
  },
  detailRowBorder: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#D5DEDC',
  },
  detailText: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    color: MUTED,
  },
  detailValue: {
    marginTop: 2,
    fontSize: 15,
    color: TEXT,
    fontWeight: '500',
  },
  detailEmpty: {
    color: '#A3B1AF',
    fontWeight: '400',
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
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    paddingTop: 8,
    paddingBottom: 24,
  },
  sheetAction: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  sheetLabel: {
    marginLeft: 12,
    fontSize: 16,
    color: TEXT,
    fontWeight: '500',
  },
});
