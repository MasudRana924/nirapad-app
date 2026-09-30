import React, {useMemo} from 'react';
import {StyleSheet, View, useWindowDimensions} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';

const ICONS = [
  'medkit-outline',
  'heart-outline',
  'chatbubble-ellipses-outline',
  'leaf-outline',
  'bandage-outline',
  'happy-outline',
  'pulse-outline',
  'shield-checkmark-outline',
  'flower-outline',
  'home-outline',
];
const ROTATIONS = ['-18deg', '12deg', '-6deg', '20deg', '0deg', '-12deg'];
const CELL = 64;

const ChatThemeBackground = () => {
  const {width, height} = useWindowDimensions();

  const items = useMemo(() => {
    const cols = Math.ceil(width / CELL) + 1;
    const rows = Math.ceil(height / CELL) + 1;
    const list = [];
    for (let r = 0; r < rows; r += 1) {
      for (let c = 0; c < cols; c += 1) {
        const index = r * cols + c;
        list.push({
          key: `${r}-${c}`,
          icon: ICONS[(r * 3 + c) % ICONS.length],
          left: c * CELL + (r % 2 ? CELL / 2 : 0) - 12,
          top: r * CELL + 10,
          rotate: ROTATIONS[index % ROTATIONS.length],
          size: index % 3 === 0 ? 20 : 17,
        });
      }
    }
    return list;
  }, [width, height]);

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <LinearGradient
        colors={['#EAF6F2', '#FFFFFF', '#E7F3EF']}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 1}}
        style={StyleSheet.absoluteFill}
      />
      {items.map(item => (
        <Icon
          key={item.key}
          name={item.icon}
          size={item.size}
          color="rgba(0, 129, 120, 0.09)"
          style={[
            styles.icon,
            {left: item.left, top: item.top, transform: [{rotate: item.rotate}]},
          ]}
        />
      ))}
    </View>
  );
};

export default ChatThemeBackground;

const styles = StyleSheet.create({
  icon: {
    position: 'absolute',
  },
});
