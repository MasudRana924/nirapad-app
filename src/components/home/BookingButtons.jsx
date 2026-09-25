import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {useTranslation} from 'react-i18next';

const TEAL = '#008178';
const INK = '#0B3F3C';
const MINT = '#E8F5F2';
const DISABLED = '#C5CDD6';
const DISABLED_BG = '#F5F5F5';

const BookingButtons = ({navigation}) => {
  const {t} = useTranslation();

  const ACTIONS = [
    {
      key: 'caregiver',
      label: t('bookCaregiver'),
      icon: 'person',
      onPress: navigation =>
        navigation?.navigate('SelectFamilyMember', {serviceType: 'caregiver'}),
    },
    {
      key: 'nurse',
      label: t('bookNurse'),
      icon: 'medical',
      onPress: navigation => navigation?.navigate('SelectNurse'),
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
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{t('quickActions')}</Text>
        <Icon name="arrow-forward" size={18} color={INK} />
      </View>

      <View style={styles.row}>
        {ACTIONS.map(action => (
          <TouchableOpacity
            key={action.key}
            activeOpacity={0.85}
            style={[
              styles.card,
              action.key === 'caregiver' ? styles.caregiverCard : styles.nurseCard,
            ]}
            onPress={() => action.onPress(navigation)}>
            <Icon
              name={action.icon}
              size={17}
              color={TEAL}
              style={styles.fixedIcon}
            />
            <Text style={styles.cardLabel} numberOfLines={1}>
              {action.label}
            </Text>
            <Icon
              name="chevron-forward"
              size={15}
              color={TEAL}
              style={styles.fixedIcon}
            />
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.disabledRow}>
        {DISABLED_SERVICES.map(service => (
          <View key={service.key} style={styles.disabledCard}>
            <Icon
              name={service.icon}
              size={24}
              color={DISABLED}
            />
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
    marginTop: 28,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: INK,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  disabledRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  card: {
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: MINT,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 10,
    gap: 6,
  },
  caregiverCard: {
    flex: 1.25,
  },
  nurseCard: {
    flex: 1,
  },
  fixedIcon: {
    flexShrink: 0,
  },
  cardLabel: {
    flex: 1,
    minWidth: 0,
    fontSize: 12.5,
    fontWeight: '600',
    color: INK,
  },
  disabledCard: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    paddingVertical: 8,
    gap: 4,
  },
  disabledLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: DISABLED,
    textAlign: 'center',
  },
});
