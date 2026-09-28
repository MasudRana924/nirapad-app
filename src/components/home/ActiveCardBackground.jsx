import React from 'react';
import {View, StyleSheet} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

const Box = ({x, y, w, h, color, r = 0}) => (
  <View
    style={{
      position: 'absolute',
      left: x,
      top: y,
      width: w,
      height: h,
      backgroundColor: color,
      borderRadius: r,
    }}
  />
);

const Dot = ({cx, cy, r, color, opacity = 1}) => (
  <View
    style={{
      position: 'absolute',
      left: cx - r,
      top: cy - r,
      width: r * 2,
      height: r * 2,
      borderRadius: r,
      backgroundColor: color,
      opacity,
    }}
  />
);

const Cloud = ({x, y, scale = 1, opacity = 0.95}) => (
  <View
    style={[
      styles.cloud,
      {left: x, top: y, opacity, transform: [{scale}]},
    ]}>
    <Box x={0} y={8} w={30} h={11} r={6} color="#FFFFFF" />
    <Dot cx={10} cy={9} r={6} color="#FFFFFF" />
    <Dot cx={19} cy={7} r={8} color="#FFFFFF" />
  </View>
);

const MAIN_WINDOWS = [52, 64, 76].flatMap(row =>
  [284, 293, 302].map(col => ({row, col})),
);
const WING_WINDOWS = [70, 82, 94].flatMap(row =>
  [262, 272, 314, 324].map(col => ({row, col})),
);

const Hospital = () => (
  <View style={styles.hospital} pointerEvents="none">
    <Box x={232} y={109} w={128} h={10} r={5} color="#CBE8DF" />

    <Box x={256} y={58} w={28} h={5} r={1.5} color="#9ED3C6" />
    <Box x={258} y={63} w={24} h={50} color="#E6F5F0" />
    <Box x={308} y={58} w={28} h={5} r={1.5} color="#9ED3C6" />
    <Box x={310} y={63} w={24} h={50} color="#E6F5F0" />

    <Box x={276} y={40} w={40} h={5} r={1.5} color="#7CC3B3" />
    <Box x={278} y={45} w={36} h={68} color="#F4FBF8" />

    <Box x={287} y={20} w={18} h={17} r={3.5} color="#3FA58F" />
    <Box x={294.5} y={23.5} w={3} h={10} r={1} color="#FFFFFF" />
    <Box x={291} y={27} w={10} h={3} r={1} color="#FFFFFF" />

    {MAIN_WINDOWS.map(({row, col}) => (
      <Box
        key={`m-${row}-${col}`}
        x={col}
        y={row}
        w={6}
        h={7}
        r={1}
        color="#A9DACD"
      />
    ))}
    <Box x={290} y={92} w={12} h={21} r={1.5} color="#7CC3B3" />
    <Box x={295.5} y={92} w={1} h={21} color="#E6F5F0" />

    {WING_WINDOWS.map(({row, col}) => (
      <Box
        key={`w-${row}-${col}`}
        x={col}
        y={row}
        w={5}
        h={6}
        r={1}
        color="#C3E5DB"
      />
    ))}

    <Box x={248.8} y={100} w={2.4} h={13} color="#8CCBBA" />
    <Dot cx={250} cy={96} r={10} color="#A8DACB" />
    <Dot cx={245} cy={101} r={6} color="#B7E1D5" />

    <Box x={341.8} y={102} w={2.2} h={11} color="#8CCBBA" />
    <Dot cx={343} cy={99} r={8.5} color="#B4E0D3" />

    <Dot cx={266} cy={111} r={5} color="#BFE4D9" />
    <Dot cx={273} cy={112} r={4} color="#CBEAE1" />
    <Dot cx={324} cy={111} r={5} color="#BFE4D9" />
    <Dot cx={331} cy={112} r={4} color="#CBEAE1" />

    <Cloud x={220} y={22} scale={0.9} />
    <Cloud x={326} y={10} scale={0.75} opacity={0.85} />

    {[0, 1, 2, 3].flatMap(r =>
      [0, 1, 2, 3, 4].map(c => (
        <Dot
          key={`d-${r}-${c}`}
          cx={200 + c * 9}
          cy={14 + r * 9}
          r={1.2}
          color="#B9E0D5"
          opacity={0.7}
        />
      )),
    )}
  </View>
);

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
    <Hospital />
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
  hospital: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 360,
    height: 130,
    marginRight: -8,
  },
  cloud: {
    position: 'absolute',
    width: 30,
    height: 20,
  },
});
