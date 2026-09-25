import React, {useState} from 'react';
import {View, Text, StyleSheet, Switch, TouchableOpacity} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import Header from '../components/common/Header';
import Loader from '../components/common/Loader';
import {useNotificationPreferences} from '../api/queries';
import {useUpdateNotificationPreferences} from '../api/mutations';
import {useAppModal} from '../contexts/ModalContext';
import {getApiErrorMessage} from '../api/client';
import {useTranslation} from 'react-i18next';

const isMutedPrefs = prefs =>
  prefs?.muted === true ||
  prefs?.mute === true ||
  prefs?.push_enabled === false ||
  prefs?.notifications_enabled === false;

const withMute = (prefs, muted) => {
  const next = {...(prefs || {})};
  if ('push_enabled' in next) {
    next.push_enabled = !muted;
  }
  if ('notifications_enabled' in next) {
    next.notifications_enabled = !muted;
  }
  if ('mute' in next) {
    next.mute = muted;
  }
  next.muted = muted;
  return next;
};

const NotificationSettingsScreen = ({navigation}) => {
  const {t} = useTranslation();
  const {showModal} = useAppModal();
  const {data, isLoading, refetch} = useNotificationPreferences();
  const updatePrefs = useUpdateNotificationPreferences();
  const [saving, setSaving] = useState(false);
  const prefs = data?.data && typeof data.data === 'object' ? data.data : {};
  const muted = isMutedPrefs(prefs);

  const handleToggle = async value => {
    if (saving) {
      return;
    }
    setSaving(true);
    try {
      await updatePrefs.mutateAsync(withMute(prefs, value));
      await refetch();
    } catch (error) {
      showModal({
        type: 'error',
        title: 'Error',
        message: getApiErrorMessage(error, t('failedToUpdateNotifications')),
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom', 'left', 'right']}>
      <Loader visible={isLoading || saving} />
      <Header title={t('notificationSettings')} onBack={() => navigation?.goBack()} />

      <View style={styles.card}>
        <View style={styles.iconWrap}>
          <Icon name="notifications-off-outline" size={20} color="#008178" />
        </View>
        <View style={styles.textBlock}>
          <Text style={styles.title}>{t('muteNotifications')}</Text>
          <Text style={styles.subtitle}>
            {t('muteNotificationsDesc')}
          </Text>
        </View>
        <Switch
          value={muted}
          onValueChange={handleToggle}
          trackColor={{false: '#D1D5DB', true: '#7BC9C3'}}
          thumbColor={muted ? '#008178' : '#F4F4F5'}
        />
      </View>

      <TouchableOpacity
        activeOpacity={0.8}
        style={styles.refresh}
        onPress={() => refetch()}>
        <Text style={styles.refreshText}>{t('refreshPreferences')}</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  card: {
    marginTop: 12,
    marginHorizontal: 16,
    backgroundColor: '#F6F6F6',
    borderRadius: 16,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#E6F4F3',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  textBlock: {
    flex: 1,
    marginRight: 8,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111820',
  },
  subtitle: {
    marginTop: 2,
    fontSize: 12,
    color: '#8190A7',
    lineHeight: 17,
  },
  refresh: {
    alignItems: 'center',
    marginTop: 20,
  },
  refreshText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#008178',
  },
});

export default NotificationSettingsScreen;
