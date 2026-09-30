import React from 'react';
import {View, StyleSheet} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';

const ActiveCardBackground = () => (
  <View style={StyleSheet.absoluteFill} pointerEvents="none">
    <LinearGradient
      colors={['#F7FCFB', '#E4F4EF']}
      start={{x: 0, y: 0}}
      end={{x: 1, y: 1}}
      style={StyleSheet.absoluteFill}
    />
    <View style={styles.glow} />
    <View style={styles.cornerBlob} />
    <View style={styles.wave} />

    {/* <Icon name="heart" size={96} color="rgba(14, 139, 120, 0.08)" style={styles.heart} />
    <Icon name="medkit" size={44} color="rgba(14, 139, 120, 0.10)" style={styles.medkit} />
    <Icon name="leaf" size={38} color="rgba(14, 139, 120, 0.10)" style={styles.leaf} /> */}
  </View>
);

export default ActiveCardBackground;

const styles = StyleSheet.create({
  glow: {
    position: 'absolute',
    top: -50,
    right: -40,
    width: 190,
    height: 190,
    borderRadius: 95,
    backgroundColor: '#D8F1EA',
    opacity: 0.6,
  },
  cornerBlob: {
    position: 'absolute',
    bottom: -90,
    left: -70,
    width: 170,
    height: 170,
    borderRadius: 85,
    backgroundColor: '#E0F3EE',
    opacity: 0.9,
  },
  wave: {
    position: 'absolute',
    bottom: -120,
    left: -60,
    right: -60,
    height: 170,
    borderTopLeftRadius: 400,
    borderTopRightRadius: 300,
    backgroundColor: '#D6EFE8',
    opacity: 0.55,
  },
  heart: {
    position: 'absolute',
    right: 14,
    top: 18,
    transform: [{rotate: '-12deg'}],
  },
  medkit: {
    position: 'absolute',
    right: 96,
    top: 12,
    transform: [{rotate: '10deg'}],
  },
  leaf: {
    position: 'absolute',
    right: 90,
    bottom: 14,
    transform: [{rotate: '-20deg'}],
  },
});
