import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {useTranslation} from 'react-i18next';

const TEAL = '#0B7A6E';
const INK = '#0F1A19';

const caregiverBg = require('../../assets/home-caregiver-card-bg.png');
const nurseBg = require('../../assets/home-nurse-card-bg.png');

const BookingButtons = ({navigation}) => {
  const {t} = useTranslation();

  const ACTIONS = [
    {
      key: 'caregiver',
      label: t('homeCaregiver'),
      subLabel: 'From ৳500/day',
      icon: 'heart-outline',
      background: caregiverBg,
      cardStyle: styles.caregiverCard,
      onPress: nav =>
        nav?.navigate('SelectFamilyMember', {serviceType: 'caregiver'}),
    },
    {
      key: 'nurse',
      label: t('homeNurse'),
      subLabel: 'From ৳1,200/visit',
      icon: 'medkit-outline',
      background: nurseBg,
      cardStyle: styles.nurseCard,
      onPress: nav => nav?.navigate('SelectNurse'),
    },
  ];

  const DISABLED_SERVICES = [
    {key: 'physio', label: t('physiotherapy'), icon: 'accessibility-outline'},
    {key: 'medicine', label: t('medicine'), icon: 'bandage-outline'},
  ];

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{t('whatDoYouNeedToday')}</Text>

      <View style={styles.grid}>
        {ACTIONS.map(action => (
          <TouchableOpacity
            key={action.key}
            activeOpacity={0.9}
            style={[styles.card, action.cardStyle]}
            onPress={() => action.onPress(navigation)}>
            <ImageBackground
              source={action.background}
              resizeMode="cover"
              style={styles.cardInner}>
              <View style={styles.iconCircle}>
                <Icon name={action.icon} size={17} color={TEAL} />
              </View>

              <Text style={styles.cardLabel} numberOfLines={1}>
                {action.label}
              </Text>
              <Text style={styles.cardSubLabel} numberOfLines={1}>
                {action.subLabel}
              </Text>

              <View style={styles.bookNowRow}>
                <Text style={styles.bookNowText}>{t('homeBookNow')}</Text>
                <Icon name="chevron-forward-sharp" size={12} color={TEAL} />
              </View>
            </ImageBackground>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.disabledRow}>
        {DISABLED_SERVICES.map(service => (
          <View key={service.key} style={styles.disabledCard}>
            <Icon name={service.icon} size={18} color="#8E9A98" />
            <View style={styles.disabledCopy}>
              <Text style={styles.disabledLabel} numberOfLines={1}>
                {service.label}
              </Text>
              <Text style={styles.disabledSub} numberOfLines={1}>
                {t('comingSoon')}
              </Text>
            </View>
            <Icon name="chevron-forward-sharp" size={12} color="#A7B2B0" />
          </View>
        ))}
      </View>
    </View>
  );
};

export default BookingButtons;

const styles = StyleSheet.create({
  section: {
    marginTop: 12,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: INK,
    marginBottom: 8,
  },
  grid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  card: {
    width: '48.5%',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
  },
  caregiverCard: {
    backgroundColor: '#DDF1EB',
    borderColor: '#DDF1EB',
  },
  nurseCard: {
    backgroundColor: '#FBF1D6',
    borderColor: '#FBF1D6',
  },
  cardInner: {
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 10,
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  cardLabel: {
    fontSize: 13.5,
    lineHeight: 18,
    fontWeight: '700',
    color: INK,
  },
  cardSubLabel: {
    marginTop: 1,
    fontSize: 10,
    lineHeight: 14,
    color: '#34413F',
  },
  bookNowRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    gap: 4,
  },
  bookNowText: {
    fontSize: 14.5,
    fontWeight: '700',
    color: TEAL,
  },
  disabledRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  disabledCard: {
    width: '48.5%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F4F4',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F1F4F4',
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  disabledCopy: {
    flex: 1,
    marginLeft: 8,
    marginRight: 4,
  },
  disabledLabel: {
    fontSize: 11.5,
    lineHeight: 14,
    fontWeight: '600',
    color: '#6B7775',
  },
  disabledSub: {
    fontSize: 10,
    lineHeight: 13,
    color: '#9AA5A3',
  },
});
