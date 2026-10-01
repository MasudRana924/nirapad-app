import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity, Image} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {useTranslation} from 'react-i18next';
import {isOwnChatMessage} from '../../services/bookingChat';

export const getChatPreview = (lastMessage, t) => {
  if (!lastMessage) {
    return t('bookingChatTapToStart');
  }
  let text = lastMessage.message;
  if (!text) {
    text =
      lastMessage.message_type === 'document' ? t('sentDocument') : t('sentPhoto');
  }
  return isOwnChatMessage(lastMessage) ? `${t('you')}: ${text}` : text;
};

const BookingChatCard = ({chat, fallbackName, onPress}) => {
  const {t} = useTranslation();
  const counterpart = chat?.counterpart || {};
  const name = counterpart.name || fallbackName || t('caregiver');
  const unread = Number(chat?.unread_count || 0);

  return (
    <TouchableOpacity activeOpacity={0.85} style={styles.card} onPress={onPress}>
      {counterpart.photo ? (
        <Image source={{uri: counterpart.photo}} style={styles.avatar} />
      ) : (
        <View style={[styles.avatar, styles.avatarFallback]}>
          <Text style={styles.avatarInitial}>
            {String(name).charAt(0).toUpperCase()}
          </Text>
        </View>
      )}
      <View style={styles.body}>
        <View style={styles.titleRow}>
          <Icon name="chatbubbles" size={14} color="#008178" />
          <Text style={styles.title}>{t('chatWithCaregiver')}</Text>
        </View>
        <Text style={styles.name} numberOfLines={1}>
          {name}
        </Text>
        <Text
          style={[styles.preview, unread > 0 && styles.previewUnread]}
          numberOfLines={1}>
          {getChatPreview(chat?.last_message, t)}
        </Text>
      </View>
      {unread > 0 ? (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{unread > 99 ? '99+' : unread}</Text>
        </View>
      ) : null}
      <Icon name="chevron-forward" size={18} color="#8190A7" />
    </TouchableOpacity>
  );
};

export default BookingChatCard;

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2FAF8',
    borderRadius: 14,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#DDF0EB',
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#DDF0EB',
  },
  avatarFallback: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    fontSize: 18,
    fontWeight: '700',
    color: '#008178',
  },
  body: {
    flex: 1,
    marginHorizontal: 12,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  title: {
    fontSize: 12,
    fontWeight: '700',
    color: '#008178',
  },
  name: {
    marginTop: 2,
    fontSize: 15,
    fontWeight: '700',
    color: '#111820',
  },
  preview: {
    marginTop: 2,
    fontSize: 13,
    color: '#5C6B7A',
  },
  previewUnread: {
    color: '#111820',
    fontWeight: '600',
  },
  badge: {
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    paddingHorizontal: 6,
    backgroundColor: '#E34242',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
});
