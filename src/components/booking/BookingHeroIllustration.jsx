import React from 'react';
import {View, StyleSheet} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

const PRIMARY = '#008178';

const Leaf = ({style}) => <View style={[styles.leaf, style]} />;

const BookingHeroIllustration = () => (
  <View style={styles.wrap} pointerEvents="none">
    <View style={styles.glow} />

    <Leaf style={styles.leafLeftTall} />
    <Leaf style={styles.leafLeftShort} />
    <Leaf style={styles.leafRightTall} />
    <Leaf style={styles.leafRightShort} />

    <View style={styles.calendar}>
      <View style={styles.calendarHeader} />
      <View style={[styles.ring, styles.ringLeft]} />
      <View style={[styles.ring, styles.ringRight]} />
      <View style={styles.grid}>
        {Array.from({length: 8}).map((_, index) => (
          <View key={index} style={styles.cell} />
        ))}
      </View>
    </View>

    <View style={styles.check}>
      <Icon name="checkmark" size={16} color="#FFFFFF" />
    </View>
  </View>
);

export default BookingHeroIllustration;

const styles = StyleSheet.create({
  wrap: {
    width: 116,
    height: 84,
  },
  glow: {
    position: 'absolute',
    left: 14,
    top: 0,
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
  },
  leaf: {
    position: 'absolute',
    width: 14,
    height: 34,
    borderTopLeftRadius: 14,
    borderBottomRightRadius: 14,
    backgroundColor: '#9ED3C6',
  },
  leafLeftTall: {
    left: 6,
    bottom: 4,
    transform: [{rotate: '-28deg'}],
  },
  leafLeftShort: {
    left: 18,
    bottom: 0,
    height: 24,
    backgroundColor: '#B9E1D7',
    transform: [{rotate: '-8deg'}],
  },
  leafRightTall: {
    right: 4,
    bottom: 6,
    backgroundColor: '#8ECBBC',
    transform: [{rotate: '26deg'}],
  },
  leafRightShort: {
    right: 16,
    bottom: 0,
    height: 22,
    backgroundColor: '#B9E1D7',
    transform: [{rotate: '8deg'}],
  },
  calendar: {
    position: 'absolute',
    left: 30,
    top: 12,
    width: 58,
    height: 56,
    borderRadius: 9,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CFE7E1',
    overflow: 'hidden',
  },
  calendarHeader: {
    height: 13,
    backgroundColor: '#5FB3A3',
  },
  ring: {
    position: 'absolute',
    top: -2,
    width: 5,
    height: 9,
    borderRadius: 3,
    backgroundColor: PRIMARY,
  },
  ringLeft: {
    left: 14,
  },
  ringRight: {
    right: 14,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 6,
    paddingTop: 7,
    gap: 5,
  },
  cell: {
    width: 7,
    height: 6,
    borderRadius: 2,
    backgroundColor: '#D5ECE6',
  },
  check: {
    position: 'absolute',
    left: 72,
    top: 46,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#0F6B63',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
