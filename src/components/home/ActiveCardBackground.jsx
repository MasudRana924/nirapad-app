import React from 'react';
import {View, Image, StyleSheet} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

const careArt = require('../../assets/home-active-booking-bg.png');

const ART_SIZE = 190;

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

    <View style={styles.artWrap}>
      <Image source={careArt} style={styles.art} resizeMode="cover" />
      <LinearGradient
        colors={['#EEF8F5', 'rgba(238, 248, 245, 0)']}
        start={{x: 0, y: 0.5}}
        end={{x: 1, y: 0.5}}
        style={styles.artFadeLeft}
      />
      <LinearGradient
        colors={['rgba(232, 245, 241, 0)', '#E6F4F0']}
        start={{x: 0.5, y: 0}}
        end={{x: 0.5, y: 1}}
        style={styles.artFadeBottom}
      />
    </View>
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
  artWrap: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    right: 0,
    width: 160,
    justifyContent: 'center',
    overflow: 'hidden',
  },
  art: {
    position: 'absolute',
    right: -22,
    top: '50%',
    marginTop: -ART_SIZE / 2 - 6,
    width: ART_SIZE,
    height: ART_SIZE,
  },
  artFadeLeft: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    width: 36,
  },
  artFadeBottom: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 18,
  },
});
