import React from 'react';
import {View, Text, StyleSheet, Image} from 'react-native';
import {useTranslation} from 'react-i18next';

const TEAL = '#0B7A6E';
const INK = '#0F3D38';
const cardBg = require('../../assets/home-active-card-bg.png');

const EmptyActiveBookingCard = () => {
  const {t} = useTranslation();
  return (
    <View style={styles.card}>
      <Image source={cardBg} style={styles.bgImage} resizeMode="cover" />

      <View style={styles.statusPill}>
        <View style={styles.statusDot} />
        <Text style={styles.statusText}>{t('noActiveBooking')}</Text>
      </View>

      <Text style={styles.title}>{t('youDontHaveActiveBooking')}</Text>
      <Text style={styles.subtitle}>{t('upcomingCareBookings')}</Text>
    </View>
  );
};

export default EmptyActiveBookingCard;

const styles = StyleSheet.create({
  card: {
    marginTop: 12,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#F2FAF8',
    borderWidth: 1,
    borderColor: '#D9ECE8',
    paddingHorizontal: 16,
    paddingVertical: 16,
    minHeight: 150,
  },
  bgImage: {
    position: 'absolute',
    top: -20,
    left: 0,
    width: '100%',
    aspectRatio: 16 / 9,
  },
  statusPill: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DDF1EC',
    borderRadius: 12,
    paddingHorizontal: 9,
    paddingVertical: 3,
    gap: 5,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: TEAL,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
    color: TEAL,
  },
  title: {
    marginTop: 10,
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '700',
    color: INK,
    maxWidth: '64%',
  },
  subtitle: {
    marginTop: 4,
    fontSize: 13,
    lineHeight: 18,
    color: '#4F6360',
    maxWidth: '64%',
  },
});
