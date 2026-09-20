import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import PrimaryButton from '../common/PrimaryButton';

/**
 * Shown on Home when the user has no active booking.
 */
const EmptyActiveBookingCard = ({navigation}) => {
  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.iconTile}>
          <Icon name="calendar-outline" size={20} color="#008178" />
        </View>
        <View style={styles.headerText}>
          <Text style={styles.title}>No active booking</Text>
          <Text style={styles.subtitle}>
            Book a trusted caregiver for your family when you need care.
          </Text>
        </View>
      </View>

      <PrimaryButton
        title="Book a caregiver"
        onPress={() =>
          navigation?.navigate('SelectFamilyMember', {serviceType: 'caregiver'})
        }
        style={styles.cta}
        textStyle={styles.ctaText}
      />
    </View>
  );
};

export default EmptyActiveBookingCard;

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#E6F4F3',
    borderRadius: 18,
    padding: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#C9E4E0',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  iconTile: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  headerText: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#163532',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    lineHeight: 18,
    color: '#5F7A76',
  },
  cta: {
    height: 44,
    borderRadius: 12,
  },
  ctaText: {
    fontSize: 14,
  },
});
