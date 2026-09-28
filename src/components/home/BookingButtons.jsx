import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {useTranslation} from 'react-i18next';

const TEAL = '#008178';
const MINT = '#DCEFEA';
const SAND = '#EFE5B4';
const CARD_BG = '#F4F4F4';

const BookingButtons = ({navigation}) => {
  const {t} = useTranslation();

  const ACTIONS = [
    {
      key: 'caregiver',
      label: t('bookCaregiver'),
      subLabel: 'From ৳500/day',
      icon: 'heart-outline',
      cardStyle: styles.caregiverCard,
      iconContainer: styles.caregiverIconContainer,
      onPress: nav =>
        nav?.navigate('SelectFamilyMember', {serviceType: 'caregiver'}),
    },
    {
      key: 'nurse',
      label: t('bookNurse'),
      subLabel: 'From ৳1,200/visit',
      icon: 'medical-outline',
      cardStyle: styles.nurseCard,
      iconContainer: styles.nurseIconContainer,
      onPress: nav => nav?.navigate('SelectNurse'),
    },
  ];

  const DISABLED_SERVICES = [
    {
      key: 'physio',
      label: t('physiotherapy'),
      icon: 'fitness',
    },
    {
      key: 'medicine',
      label: t('medicine'),
      icon: 'medkit',
    },
  ];

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>What do you need? </Text>

      <View style={styles.grid}>
        {ACTIONS.map(action => (
          <TouchableOpacity
            key={action.key}
            activeOpacity={0.9}
            style={[styles.card, action.cardStyle]}
            onPress={() => action.onPress(navigation)}>
            <View style={[styles.iconContainer, action.iconContainer]}>
              <Icon name={action.icon} size={30} color={TEAL} />
            </View>

            <Text style={styles.cardLabel}>{action.label}</Text>
            <Text style={styles.cardSubLabel}>{action.subLabel}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.disabledRow}>
        {DISABLED_SERVICES.map(service => (
          <View key={service.key} style={styles.disabledCard}>
            <Icon name={service.icon} size={24} color="#C5CDD6" />
            <Text style={styles.disabledLabel} numberOfLines={1}>
              {service.label}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
};

export default BookingButtons;

const styles = StyleSheet.create({
  section: {
    marginTop: 22,
    marginBottom: 18,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111820',
    marginBottom: 18,
    lineHeight: 30,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 14,
  },
  disabledRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  disabledCard: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    paddingVertical: 8,
    gap: 4,
    opacity: 0.7,
  },
  disabledLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#C5CDD6',
    textAlign: 'center',
  },
  card: {
    width: '48.5%',
    minHeight: 150,
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 16,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'white',
  },
  caregiverCard: {
    backgroundColor: MINT,
  },
  nurseCard: {
    backgroundColor: SAND,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: CARD_BG,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },
  caregiverIconContainer: {
    borderWidth: 1,
    borderColor: '#C7E5DF',
  },
  nurseIconContainer: {
    borderWidth: 1,
    borderColor: '#E8DDA5',
  },
  cardLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0F1720',
    marginBottom: 6,
  },
  cardSubLabel: {
    fontSize: 12,
    fontWeight: '400',
    color: '#0F1720',
    opacity: 0.85,
  },
});
