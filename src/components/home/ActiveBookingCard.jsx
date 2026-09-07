import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

const ActiveBookingCard = ({navigation}) => {
  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <View style={styles.statusPill}>
          <View style={styles.statusDot} />
          <Text style={styles.statusText}>On the way</Text>
        </View>
      </View>

      <Text style={styles.title}>Hospital Assistance</Text>

      <View style={styles.infoRow}>
        <Icon name="person-outline" size={14} color="rgba(255,255,255,0.85)" />
        <Text style={styles.infoText}>Rahim Ahmed</Text>
        <View style={styles.dot} />
        <Icon name="location-outline" size={14} color="rgba(255,255,255,0.85)" />
        <Text style={styles.infoText} numberOfLines={1}>
          Square Hospital
        </Text>
      </View>

      <TouchableOpacity
        activeOpacity={0.85}
        style={styles.trackBtn}
        onPress={() => navigation?.navigate('Bookings')}>
        <Text style={styles.trackBtnText}>Track live</Text>
        <Icon name="navigate" size={14} color="#008178" />
      </TouchableOpacity>
    </View>
  );
};

export default ActiveBookingCard;

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#008178',
    borderRadius: 20,
    padding: 18,
    marginTop: 16,
  },

  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.16)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    gap: 6,
  },

  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#34D399',
  },

  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#E6F4F3',
  },

  title: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
    marginTop: 12,
  },

  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    gap: 5,
  },

  infoText: {
    color: 'rgba(255,255,255,0.88)',
    fontSize: 12,
    fontWeight: '500',
    flexShrink: 1,
  },

  dot: {
    width: 3,
    height: 3,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.5)',
  },

  trackBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 11,
    marginTop: 16,
  },

  trackBtnText: {
    color: '#008178',
    fontSize: 13,
    fontWeight: '700',
  },
});
