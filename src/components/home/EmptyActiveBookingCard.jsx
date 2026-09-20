import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

const TEAL = '#008178';
const INK = '#0B3F3C';
const MUTED = '#6F8480';
const MINT = '#E8F5F2';

/**
 * Empty active-booking state — matches home mock exactly.
 */
const EmptyActiveBookingCard = () => {
  return (
    <View style={styles.card}>
      <View style={styles.iconCircle}>
        <Icon name="calendar-outline" size={26} color={TEAL} />
        <View style={styles.plusBadge}>
          <Icon name="add" size={10} color="#FFFFFF" />
        </View>
      </View>

      <View style={styles.copy}>
        <View style={styles.statusPill}>
          <View style={styles.statusDot} />
          <Text style={styles.statusText}>No active booking</Text>
        </View>
        <Text style={styles.title}>You don't have an active booking</Text>
        <Text style={styles.subtitle}>
          Your upcoming care bookings will appear here.
        </Text>
      </View>
    </View>
  );
};

export default EmptyActiveBookingCard;

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: MINT,
    borderRadius: 20,
    paddingVertical: 18,
    paddingHorizontal: 16,
    marginTop: 18,
  },
  iconCircle: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#C9E8E2',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  plusBadge: {
    position: 'absolute',
    right: 6,
    bottom: 8,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: TEAL,
    alignItems: 'center',
    justifyContent: 'center',
  },
  copy: {
    flex: 1,
    minWidth: 0,
  },
  statusPill: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginBottom: 8,
    gap: 6,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: TEAL,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: TEAL,
  },
  title: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '700',
    color: INK,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    lineHeight: 18,
    color: MUTED,
    fontWeight: '400',
  },
});
