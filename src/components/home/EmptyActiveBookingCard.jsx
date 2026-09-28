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
    marginTop: 10,
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: '#F2FAF8',
    borderWidth: 1,
    borderColor: '#D9ECE8',
    paddingHorizontal: 14,
    paddingVertical: 12,
    minHeight: 120,
  },
  bgImage: {
    position: 'absolute',
    top: -40,
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
    marginTop: 8,
    fontSize: 15.5,
    lineHeight: 20,
    fontWeight: '700',
    color: INK,
    maxWidth: '64%',
  },
  subtitle: {
    marginTop: 3,
    fontSize: 11.5,
    lineHeight: 15,
    color: '#4F6360',
    maxWidth: '64%',
  },
});
