import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

const ActiveBookingCard = ({navigation}) => {
  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <View style={styles.statusDot} />
        <Text style={styles.statusText}>On the Way</Text>
      </View>

      <Text style={styles.title}>Hospital Assistance</Text>

      <View style={styles.infoRow}>
        <Icon name="person-outline" size={14} color="#ffffffcc" />
        <Text style={styles.infoText}>Rahim Ahmed</Text>
        <View style={styles.dot} />
        <Icon name="location-outline" size={14} color="#ffffffcc" />
        <Text style={styles.infoText}>Square Hospital</Text>
      </View>

      <TouchableOpacity activeOpacity={0.8} style={styles.trackBtn}>
        <Text style={styles.trackBtnText}>Track Live</Text>
        <Icon name="navigate-outline" size={14} color="#008178" />
      </TouchableOpacity>
    </View>
  );
};

export default ActiveBookingCard;

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#0f766e',
    borderRadius: 20,
    padding: 18,
    marginTop: 14,
  },

  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },

  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#34d399',
  },

  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#a7f3d0',
  },

  title: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
    marginTop: 8,
  },

  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 5,
  },

  infoText: {
    color: '#ffffffcc',
    fontSize: 12,
    fontWeight: '500',
  },

  dot: {
    width: 3,
    height: 3,
    borderRadius: 2,
    backgroundColor: '#ffffff80',
  },

  trackBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginTop: 16,
  },

  trackBtnText: {
    color: '#008178',
    fontSize: 13,
    fontWeight: '700',
  },
});
