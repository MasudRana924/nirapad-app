import React, {useEffect, useRef} from 'react';
import {Animated, Easing, Pressable, StyleSheet} from 'react-native';

const TRACK_WIDTH = 50;
const TRACK_HEIGHT = 30;
const THUMB_SIZE = 24;
const PADDING = (TRACK_HEIGHT - THUMB_SIZE) / 2;
const TRAVEL = TRACK_WIDTH - THUMB_SIZE - PADDING * 2;

const Toggle = ({
  value = false,
  onValueChange,
  disabled = false,
  activeColor = '#008178',
  inactiveColor = '#D5DDDB',
}) => {
  const progress = useRef(new Animated.Value(value ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(progress, {
      toValue: value ? 1 : 0,
      duration: 200,
      easing: Easing.out(Easing.quad),
      useNativeDriver: false,
    }).start();
  }, [progress, value]);

  const trackColor = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [inactiveColor, activeColor],
  });
  const translateX = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, TRAVEL],
  });

  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityState={{checked: value, disabled}}
      disabled={disabled}
      hitSlop={8}
      onPress={() => onValueChange?.(!value)}
      style={disabled && styles.disabled}>
      <Animated.View style={[styles.track, {backgroundColor: trackColor}]}>
        <Animated.View style={[styles.thumb, {transform: [{translateX}]}]} />
      </Animated.View>
    </Pressable>
  );
};

export default Toggle;

const styles = StyleSheet.create({
  track: {
    width: TRACK_WIDTH,
    height: TRACK_HEIGHT,
    borderRadius: TRACK_HEIGHT / 2,
    padding: PADDING,
    justifyContent: 'center',
  },
  thumb: {
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: THUMB_SIZE / 2,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000000',
    shadowOpacity: 0.18,
    shadowRadius: 3,
    shadowOffset: {width: 0, height: 1},
    elevation: 3,
  },
  disabled: {
    opacity: 0.5,
  },
});
