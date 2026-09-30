import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity, Image} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {useTranslation} from 'react-i18next';

const TEAL = '#0E8B78';
const INK = '#172824';

const caregiverArt = require('../../assets/home-card-caregiver.jpg');
const nurseArt = require('../../assets/home-card-nurse.jpg');
const physioArt = require('../../assets/home-card-physio.jpg');
const medicineArt = require('../../assets/home-card-medicine.jpg');

const BookingButtons = ({navigation}) => {
  const {t} = useTranslation();

  const services = [
    {
      key: 'caregiver',
      title: t('elderlyCaregiver'),
      description: t('elderlyCaregiverDesc'),
      icon: 'heart-outline',
      iconColor: '#128A78',
      background: '#D7F3EA',
      image: caregiverArt,
      onPress: () =>
        navigation?.navigate('SelectFamilyMember', {serviceType: 'caregiver'}),
    },
    {
      key: 'nurse',
      title: t('homeNurse'),
      description: t('nurseCardDesc'),
      icon: 'pulse-outline',
      iconColor: '#1C8F86',
      background: '#FFF1DE',
      image: nurseArt,
      onPress: () => navigation?.navigate('SelectNurse'),
    },
    {
      key: 'physio',
      title: t('physiotherapy'),
      description: t('physioCardDesc'),
      icon: 'accessibility-outline',
      iconColor: '#6A63C6',
      background: '#ECEEFB',
      image: physioArt,
      onPress: () =>
        navigation?.navigate('SelectFamilyMember', {serviceType: 'physio'}),
    },
    {
      key: 'medicine',
      title: t('medicine'),
      description: t('medicineCardDesc'),
      icon: 'medkit-outline',
      iconColor: '#E15B73',
      background: '#FDE8EE',
      image: medicineArt,
      onPress: () => navigation?.navigate('Medicine'),
    },
  ];

  return (
    <View style={styles.section}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>{t('whatDoYouNeedToday')}</Text>
        <TouchableOpacity
          activeOpacity={0.7}
          style={styles.viewAll}
          onPress={() => navigation?.navigate('Services')}>
          <Text style={styles.viewAllText}>{t('viewAll')}</Text>
          <Icon name="chevron-forward" size={14} color={TEAL} />
        </TouchableOpacity>
      </View>
      <Text style={styles.hint}>{t('chooseServiceHint')}</Text>

      <View style={styles.grid}>
        {services.map(service => (
          <TouchableOpacity
            key={service.key}
            activeOpacity={0.9}
            style={[styles.card, {backgroundColor: service.background}]}
            onPress={service.onPress}>
            <Image source={service.image} style={styles.art} resizeMode="cover" />
            <View style={styles.cardBody}>
              <View style={styles.iconCircle}>
                <Icon name={service.icon} size={18} color={service.iconColor} />
              </View>
              <Text style={styles.cardTitle} numberOfLines={1}>
                {service.title}
              </Text>
              <Text style={styles.cardDesc} numberOfLines={3}>
                {service.description}
              </Text>
              <View style={styles.spacer} />
              <View style={styles.bookRow}>
                <Text style={styles.bookText}>{t('homeBookNow')}</Text>
                <Icon name="chevron-forward" size={14} color={TEAL} />
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

export default BookingButtons;

const styles = StyleSheet.create({
  section: {
    marginTop: 26,
    paddingHorizontal: 16,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    flex: 1,
    fontSize: 20,
    lineHeight: 26,
    fontWeight: '800',
    color: INK,
    letterSpacing: -0.3,
    marginRight: 8,
  },
  viewAll: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  viewAllText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: TEAL,
  },
  hint: {
    marginTop: 4,
    marginBottom: 16,
    fontSize: 13,
    lineHeight: 18,
    color: '#6E7E7A',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  card: {
    width: '48.4%',
    aspectRatio: 0.92,
    borderRadius: 22,
    overflow: 'hidden',
    marginBottom: 12,
  },
  art: {
    position: 'absolute',
    width: 220,
    height: 220,
    right: -4,
    bottom: -6,
  },
  cardBody: {
    flex: 1,
    paddingHorizontal: 14,
    paddingTop: 16,
    paddingBottom: 14,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  cardTitle: {
    maxWidth: '78%',
    fontSize: 15.5,
    lineHeight: 20,
    fontWeight: '800',
    color: INK,
  },
  cardDesc: {
    maxWidth: '72%',
    marginTop: 3,
    fontSize: 11.5,
    lineHeight: 15.5,
    color: '#3E514C',
    fontWeight: '500',
  },
  spacer: {
    flex: 1,
    minHeight: 8,
  },
  bookRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  bookText: {
    fontSize: 13.5,
    fontWeight: '800',
    color: TEAL,
  },
});
