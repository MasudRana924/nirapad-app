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
                <Icon name={action.icon} size={24} color={TEAL} />
              </View>

              <Text style={styles.cardLabel} numberOfLines={1}>
                {action.label}
              </Text>
              <Text style={styles.cardSubLabel} numberOfLines={1}>
                {action.subLabel}
              </Text>

              <View style={styles.bookNowRow}>
                <Text style={styles.bookNowText}>{t('homeBookNow')}</Text>
                <Icon name="arrow-forward" size={14} color={TEAL} />
              </View>
            </ImageBackground>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.disabledRow}>
        {DISABLED_SERVICES.map(service => (
          <View key={service.key} style={styles.disabledCard}>
            <Icon name={service.icon} size={24} color="#8E9A98" />
            <View style={styles.disabledCopy}>
              <Text style={styles.disabledLabel} numberOfLines={1}>
                {service.label}
              </Text>
              <Text style={styles.disabledSub} numberOfLines={1}>
                {t('comingSoon')}
              </Text>
            </View>
            <Icon name="arrow-forward" size={14} color="#A7B2B0" />
          </View>
        ))}
      </View>
    </View>
  );
};

export default BookingButtons;

const styles = StyleSheet.create({
  section: {
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 19,
    fontWeight: '700',
    color: INK,
    marginBottom: 10,
  },
  grid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  card: {
    width: '48.5%',
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1,
  },
  caregiverCard: {
    backgroundColor: '#DDF1EB',
    borderColor: '#CDE8E0',
  },
  nurseCard: {
    backgroundColor: '#FBF1D6',
    borderColor: '#F1E4BD',
  },
  cardInner: {
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 12,
  },
  iconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  cardLabel: {
    fontSize: 17,
    fontWeight: '700',
    color: INK,
  },
  cardSubLabel: {
    marginTop: 3,
    fontSize: 13,
    color: '#34413F',
  },
  bookNowRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 6,
  },
  bookNowText: {
    fontSize: 14,
    fontWeight: '700',
    color: TEAL,
  },
  disabledRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  disabledCard: {
    width: '48.5%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F4F4',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E4E9E8',
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  disabledCopy: {
    flex: 1,
    marginLeft: 10,
    marginRight: 4,
  },
  disabledLabel: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#6B7775',
  },
  disabledSub: {
    marginTop: 1,
    fontSize: 11,
    color: '#9AA5A3',
  },
});
